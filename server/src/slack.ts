import axios from "axios";
import { Occupant } from "./types";

export function announce(message: string) {
  if (!process.env.SLACK_ENDPOINT_SEND)
    throw new Error("SLACK_ENDPOINT_SEND var missing!");
  axios.post(process.env.SLACK_ENDPOINT_SEND, {
    text: message,
  });
}

export function announceChange(
  action: "checkin" | "checkout",
  person: Occupant,
  occupants: Occupant[]
) {
  const remaining =
    occupants.length > 0
      ? `Current occupants: ${occupants.map((o) => o.id).join(", ")}`
      : "The clubroom is empty.";
  const verbs = {
    checkin: "entered",
    checkout: "left",
  };
  const emojis = {
    checkin: "🥳",
    checkout: "👋",
  };
  const message = `${emojis[action]} *${person.id} has ${verbs[action]} the clubroom!*\n\n${remaining}`;
  announce(message);
}
