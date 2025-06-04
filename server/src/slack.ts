import axios from "axios";
import { Occupant } from "./types";
import { getOccupants, getLastMessage, setLastMessage, LastMessageData } from "./firebase";

export type Action = "checkin" | "checkout" | "change";

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
      const lastMessage = await getLastMessage();
      
      if (lastMessage) {
        const condensedText = getCondensedMessage(
          lastMessage.action.action as Action, 
          { id: lastMessage.occupant.id, expiration: lastMessage.occupant.expiration }
        );
        await updateMessage(lastMessage.channel, lastMessage.timestamp, condensedText);
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
      
      if (result.ts && person.id) {
        const messageData: LastMessageData = {
          action: { action },
          occupant: { id: person.id, expiration: person.expiration ?? "" },
          channel: result.channel ?? process.env.SLACK_CHANNEL_ID ?? "",
          timestamp: result.ts,
        };
        await setLastMessage(messageData);
      }

    } catch (error) {
      console.error("Failed to announce change:", error);
    }
  });

  await announceMutex;
}

