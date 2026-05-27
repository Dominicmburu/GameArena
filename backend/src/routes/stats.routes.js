import { Router } from "express";
import { getHomepageStats } from "../controllers/stats.controller.js";

export const stats = Router();

stats.get("/homepage", getHomepageStats);
