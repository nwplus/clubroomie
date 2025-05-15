import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../serviceAccount.json";
import { Occupant } from "./types";
import { DEFAULT_STAY_DUATION_MINS } from "./constants";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();
const occupantsDocRef = db.collection("InternalProjects").doc("Clubroomie");

export async function addOccupant(
  name: string,
  expiration?: string
): Promise<Occupant[]> {
  const exitTime = new Date(Date.now() + DEFAULT_STAY_DUATION_MINS * 60 * 1000);
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
  for (const { id, expiration } of occupants) {
    if (expiration && currentTime < expiration) continue;
    if (id) {
      removed.push(id);
      removeOccupant(id);
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
