import { Router } from "express";
import {
  signup,
  login,
  logout,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const auth = Router();

auth.post("/signup", signup);
auth.post("/login", login);
auth.post("/verify-email", verifyEmail);
auth.post("/resend-verification", resendVerification);
auth.post("/forgot-password", forgotPassword);
auth.post("/reset-password", resetPassword);
auth.post("/logout", requireAuth, logout);
auth.get("/me", requireAuth, me);
