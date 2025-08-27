import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { 
  listGames, 
  getGame,
  getGameCompetitions,
  createGame, 
  updateGame,
  deleteGame, 
  getGameStats,
  getGameTypes,
  getPopularGames
} from "../controllers/game.controller.js";

export const games = Router();

// Public routes
games.get("/", listGames);
games.get("/types", getGameTypes);
games.get("/popular", getPopularGames);
games.get("/:id", getGame);
games.get("/:id/competitions", getGameCompetitions);
games.get("/:id/stats", getGameStats);

// Protected routes (require authentication)
games.use(requireAuth);
games.post("/", createGame);
games.put("/:id", updateGame);
games.delete("/:id", deleteGame);