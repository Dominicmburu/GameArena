import { Router } from "express";
import { globalLeaderboard, competitionLeaderboard } from "../controllers/leaderboard.controller.js";

export const leaderboard = Router();

leaderboard.get("/global", globalLeaderboard);
leaderboard.get("/competition/:code", competitionLeaderboard);
