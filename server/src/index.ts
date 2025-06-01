import "dotenv/config";
import express from "express";
import cors from "cors";
import { getOccupants } from "./firebase";
import { initializeSweeper } from "./cron";
import { Occupant } from "./types";
import { enterClubroom, changeStay, leaveClubroom } from "./occupants";

initializeSweeper();

const app = express();
app.use(express.json());
app.use(cors());

if (!process?.env?.PORT) throw new Error("PORT variable missing!");

app.post("/checkin", async (req, res) => {
  const person = req.body as Occupant;
  console.log(`Checking in ${person.id} until ${person.expiration}`);
  if (!person.id) {
    res.status(400).send("Please provide an ID.");
    return;
  }

  const currentOccupants = await getOccupants();
  const currentOccupantIds = currentOccupants.map((p) => p.id);
  if (currentOccupantIds.includes(person.id)) {
    changeStay(person);
  } else {
    enterClubroom(person);
  }

  res.send(currentOccupants.concat(person));
});

app.post("/checkout", async (req, res) => {
  const person = req.body;
  console.log(`Checking out ${person.id}`);
  if (!person.id) {
    res.status(400).send("Please provide an ID.");
    return;
  }

  leaveClubroom(person);
  res.send(await getOccupants());
});

app.get("/occupants", async (req, res) => {
  const occupants = await getOccupants();
  res.json(occupants);
});

app.get("/healthcheck", async (req, res) => {
  res.status(200).send("Clubroomie API is running!");
});

app.listen(process.env.PORT);
console.log(`Server listening on port ${process.env.PORT}`);
