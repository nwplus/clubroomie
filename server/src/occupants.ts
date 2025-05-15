import { addOccupant, getOccupants, removeOccupant } from "./firebase";
import { announceChange } from "./slack";
import { Occupant } from "./types";

export async function leaveClubroom(person: Occupant) {
  if (!person.id) throw new Error("ID is missing!");
  if ((await getOccupants()).length == 0) return;
  await removeOccupant(person.id);
  await announceChange("checkout", person);
}

export async function enterClubroom(person: Occupant) {
  if (!person.id) throw new Error("ID is missing!");
  await addOccupant(person.id, person.expiration);
  await announceChange("checkin", person);
}

export async function changeStay(person: Occupant) {
  if (!person.id) throw new Error("ID is missing!");
  await addOccupant(person.id, person.expiration);
  await announceChange("change", person);
}
