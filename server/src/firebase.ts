import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { Occupant } from "./types";
import { leaveClubroom } from "./occupants";
import serviceAccount from "../serviceAccount.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();
const occupantsDocRef = db.collection("InternalProjects").doc("Clubroomie");

/**
 * Type of metadata stored for the last message.
 */
export type LastMessageData = {
  action: {
    action: string;
  };
  occupant: {
    id: string;
    expiration: string;
  };
  channel: string;
  timestamp: string;
};

/**
 * Adds a new occupant to the clubroom.
 */
export async function addOccupant(
  name: string,
  expiration?: string
): Promise<Occupant[]> {
  if (!process.env.DEFAULT_STAY_DURATION_MIN)
    throw new Error("DEFAULT_STAY_DURATION_MIN env missing!");
  const exitTime = new Date(
    Date.now() + parseInt(process.env.DEFAULT_STAY_DURATION_MIN) * 60 * 1000
  );
  await occupantsDocRef.set(
    {
      Occupants: {
        [name]: {
          expiration: expiration ?? exitTime.toISOString(),
        },
      },
    },
    { merge: true }
  );
  return await getOccupants();
}

/**
 * Checks for expired occupants and removes them from the clubroom.
 */
export async function checkExpirations(): Promise<string[]> {
  const occupants = await getOccupants();
  const currentTime = new Date().toISOString();
  const removed = [];
  for (const person of occupants) {
    if (person.expiration && currentTime < person.expiration) continue;
    if (person.id) {
      removed.push(person.id);
      leaveClubroom(person);
    }
  }
  return removed;
}

/**
 * Removes an occupant from the clubroom.
 */
export async function removeOccupant(id: string): Promise<Occupant[]> {
  await occupantsDocRef.update({
    [`Occupants.${id}`]: FieldValue.delete(),
  });
  return await getOccupants();
}

/**
 * Gets all occupants from the clubroom.
 */
export async function getOccupants(): Promise<Occupant[]> {
  const snapshot = await occupantsDocRef.get();
  const data = snapshot.data();
  const occupants = (data?.Occupants as Record<string, any>) ?? {};

  const result = Object.entries(occupants).map(([id, value]) => ({
    id,
    ...value,
  }));

  return result;
}

/**
 * Gets the last message sent by the bot..
 */
export async function getLastMessage(): Promise<LastMessageData | null> {
  try {
    const snapshot = await occupantsDocRef.get();
    const data = snapshot.data();
    return (data?.lastMessage as LastMessageData) ?? null;
  } catch (error) {
    return null;
  }
}

/**
 * Sets metadata of last message sent by the bot.
 */
export async function setLastMessage(messageData: LastMessageData): Promise<void> {
  try {
    await occupantsDocRef.update({ lastMessage: messageData });
  } catch (error) {
    return;
  }
}

