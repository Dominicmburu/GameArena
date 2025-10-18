import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePassword,
  updatePreferences,
  getStats,
  getAchievements,
  deleteAccount,
  getPublicProfile,
  exportData
} from "../controllers/profile.controller.js";

export const profile = Router();

// Protected routes (require authentication)
profile.get("/me", requireAuth, getProfile);
profile.put("/me", requireAuth, updateProfile);
profile.delete("/me", requireAuth, deleteAccount);

profile.patch("/avatar", requireAuth, updateAvatar);
profile.post("/password", requireAuth, updatePassword);
profile.patch("/preferences", requireAuth, updatePreferences);

profile.get("/stats", requireAuth, getStats);
profile.get("/achievements", requireAuth, getAchievements);
profile.get("/export", requireAuth, exportData);

// Public routes
profile.get("/user/:username", getPublicProfile);