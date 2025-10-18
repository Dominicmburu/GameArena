import { Router } from "express";
import { auth } from "./auth.routes.js";
import { wallet } from "./wallet.routes.js";
import { competitions } from "./competition.routes.js";
import { invite } from "./invite.routes.js";
import { leaderboard } from "./leaderboard.routes.js";
import { training } from "./training.routes.js";
import { history } from "./history.routes.js";
import { games } from "./game.routes.js";
import { profile } from "./profile.routes.js";

export const routes = Router();

routes.use("/auth", auth);
routes.use("/wallet", wallet);
routes.use("/competitions", competitions);
routes.use("/invite", invite);
routes.use("/leaderboard", leaderboard);
routes.use("/training", training);
routes.use("/history", history);
routes.use("/games", games);
routes.use("/profile", profile);