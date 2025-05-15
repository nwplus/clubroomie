import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../serviceAccount.json";
import { Occupant } from "./types";
import { leaveClubroom } from "./occupants";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();
const occupantsDocRef = db.collection("InternalProjects").doc("Clubroomie");

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

export async function removeOccupant(id: string): Promise<Occupant[]> {
  await occupantsDocRef.update({
    [`Occupants.${id}`]: FieldValue.delete(),
  });
  return await getOccupants();
}

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
