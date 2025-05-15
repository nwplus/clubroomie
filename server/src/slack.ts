import axios from "axios";
import { Occupant } from "./types";
import { getOccupants } from "./firebase";

export function announce(message: string) {
  if (!process.env.SLACK_ENDPOINT_SEND)
    throw new Error("SLACK_ENDPOINT_SEND var missing!");
  axios.post(process.env.SLACK_ENDPOINT_SEND, {
    text: message,
  });
}

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

export type Action = "checkin" | "checkout" | "extend";

export async function announceChange(action: Action, person: Occupant) {
  const messages: Record<Action, string> = {
    checkin: "entered the clubroom!",
    checkout: "left the clubroom!",
    extend: `extended their stay!`,
  };

  const emojis: Record<Action, string> = {
    checkin: "🥳",
    checkout: "👋",
    extend: "⏰",
  };

  const occupants = await getOccupants();

  const formattedOccupants =
    occupants.length > 0
      ? `*Current occupants:*\n${occupants
          .map((o) => `- ${o.id} (until ${formatExpiration(o.expiration)})`)
          .join("\n")}`
      : "The clubroom is empty.";

  const message = `${emojis[action]} *${person.id} has ${messages[action]}*\n\n${formattedOccupants}`;

  announce(message);
}
