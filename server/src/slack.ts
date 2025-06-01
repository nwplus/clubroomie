import axios from "axios";
import { Occupant } from "./types";
import { getOccupants } from "./firebase";

export type Action = "checkin" | "checkout" | "change";

// Cache last message metadata
let lastMessageTs: string | null = null;
let lastMessageChannel: string | null = null;
let lastMessageAction: { action: Action; person: Occupant } | null = null;
let announceMutex: Promise<void> = Promise.resolve();

/**
 * Send a message to the configured Slack channel
 */
async function sendMessage(message: string): Promise<{ ts?: string; channel?: string }> {
  if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
    throw new Error("SLACK_BOT_TOKEN and SLACK_CHANNEL_ID required for Web API");
  }

  try {
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.SLACK_CHANNEL_ID,
      text: message,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.ok) {
      return { ts: response.data.ts, channel: response.data.channel };
    } else {
      throw new Error(`Slack API error: ${response.data.error}`);
    }
  } catch (error) {
    console.error("Failed to send message via Web API:", error);
    throw error;
  }
}

/**
 * Given stored metadata of the last message, updates the message to a condensed version.
 */
async function updateMessage(channel: string, ts: string, text: string) {
  if (!process.env.SLACK_BOT_TOKEN) {
    console.warn("SLACK_BOT_TOKEN not available, cannot update messages");
    return;
  }

  try {
    const response = await axios.post('https://slack.com/api/chat.update', {
      channel,
      ts,
      text,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.ok) {
      console.error(`Failed to update message: ${response.data.error}`);
    }
  } catch (error) {
    console.error("Failed to update message:", error);
  }
}

/**
 * Condenses given message to plain text.
 */
function getCondensedMessage(action: Action, person: Occupant): string {
  const messages: Record<Action, string> = {
    checkin: "entered the clubroom!",
    checkout: "left the clubroom!",
    change: "changed their stay time!",
  };
  
  return `${person.id} ${messages[action]}`;
}

/**
 * Formats the expiration date of an occupant.
 */
function formatExpiration(iso: string) {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles", // PST/PDT
  };
  return new Intl.DateTimeFormat("en-US", options).format(date).toLowerCase(); // e.g., "4:20 PM"
}

/**
 * Announces a change to the clubroom i.e. a person entered, left, or changed their stay time.
 */
export async function announceChange(action: Action, person: Occupant) {
  announceMutex = announceMutex.then(async () => {
    try {
      if (lastMessageTs && lastMessageChannel && lastMessageAction) {
        const condensedText = getCondensedMessage(lastMessageAction.action, lastMessageAction.person);
        await updateMessage(lastMessageChannel, lastMessageTs, condensedText);
      }

      const messages: Record<Action, string> = {
        checkin: "entered the clubroom!",
        checkout: "left the clubroom!",
        change: `changed their stay time!`,
      };

      const emojis: Record<Action, string> = {
        checkin: "🥳",
        checkout: "👋",
        change: "⏰",
      };

      const occupants = await getOccupants();

      const formattedOccupants =
        occupants.length > 0
          ? `*Current occupants:*\n${occupants
              .map((o) => `- ${o.id} (until ${formatExpiration(o.expiration)})`)
              .join("\n")}`
          : "The clubroom is empty.";

      const message = `${emojis[action]} *${person.id} has ${messages[action]}*\n\n${formattedOccupants}`;
      const result = await sendMessage(message);
      lastMessageTs = result.ts || null;
      lastMessageChannel = result.channel || process.env.SLACK_CHANNEL_ID || null;
      lastMessageAction = { action, person };

    } catch (error) {
      console.error("Failed to announce change:", error);
    }
  });

  await announceMutex;
}

