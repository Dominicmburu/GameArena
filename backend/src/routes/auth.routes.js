import { Router } from "express";
import { signup, login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const auth = Router();

auth.post("/signup", signup);
auth.post("/login", login);
auth.post("/logout", requireAuth, logout);
auth.get("/me", requireAuth, me);