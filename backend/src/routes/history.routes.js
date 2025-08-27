import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { myHistory } from "../controllers/history.controller.js";

export const history = Router();

history.use(requireAuth);
history.get("/mine", myHistory);