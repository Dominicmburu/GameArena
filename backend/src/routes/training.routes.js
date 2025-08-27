import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createSession, listMyTraining, getTrainingStats } from "../controllers/training.controller.js";

export const training = Router();

training.use(requireAuth);
training.post("/session", createSession);
training.get("/mine", listMyTraining);
training.get("/stats", getTrainingStats);