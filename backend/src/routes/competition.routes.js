import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { 
  listMine, 
  listPublic,
  create, 
  joinByCode, 
  getCompetition,
  readyUp, 
  submitScore, 
  complete, 
  getUserCompetitions
} from "../controllers/competition.controller.js";

export const competitions = Router();

competitions.get("/public", listPublic);

competitions.get("/mine", requireAuth, listMine);
competitions.get("/participated-competitions", requireAuth, getUserCompetitions);
competitions.post("/create", requireAuth, create);
competitions.post("/:code/join", requireAuth, joinByCode);
competitions.post("/:code/ready", requireAuth, readyUp);
competitions.post("/:code/score", requireAuth, submitScore);
competitions.post("/:code/complete", requireAuth, complete);

competitions.get("/:code", getCompetition);

