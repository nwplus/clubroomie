import express from "express";
import cors from "cors";
import { addOccupant, getOccupants, removeOccupant } from "./firebase";
import { initializeSweeper } from "./cron";
import { announceChange } from "./slack";
import { Occupant } from "./types";

initializeSweeper();

const app = express();
app.use(express.json());
app.use(cors());

if (!process?.env?.PORT) throw new Error("PORT variable missing!");

app.post("/checkin", async (req, res) => {
  const person = req.body as Occupant;
  console.log("Checking in", person.id);
  if (!person.id) {
    res.status(400).send("Please provide an ID.");
    return;
  }

  addOccupant(person.id, person.expiration);
  const newOccupants = await getOccupants();
  announceChange("checkin", person, newOccupants);
  res.send(newOccupants);
});

app.post("/checkout", async (req, res) => {
  const person = req.body;
  console.log("Checking out", person.id);
  if (!person.id) {
    res.status(400).send("Please provide an ID.");
    return;
  }
  if ((await getOccupants()).length == 0) {
    res.send(200);
    return;
  }

  removeOccupant(person.id);
  const newOccupants = await getOccupants();
  announceChange("checkout", person, newOccupants);
  res.send(newOccupants);
});

app.get("/occupants", async (req, res) => {
  const occupants = await getOccupants();
  res.json(occupants);
});

app.listen(process.env.PORT);
console.log(`Server listening on port ${process.env.PORT}`);
