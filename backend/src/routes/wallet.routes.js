import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getBalance,
  getTransactions,
  deposit,
  withdraw,
  checkDepositStatus,
  getPendingTransactions,
  mpesaCallback,
  mpesaB2CResult,
  mpesaB2CTimeout
} from '../controllers/wallet.controller.js';

export const wallet = Router();

// Protected routes (require authentication)
wallet.get("/balance", requireAuth, getBalance);
wallet.get("/transactions", requireAuth, getTransactions);
wallet.get("/pending", requireAuth, getPendingTransactions);

// Deposit
wallet.post("/deposit", requireAuth, deposit);
wallet.get("/deposit/status/:checkoutRequestId", requireAuth, checkDepositStatus);

// Withdrawal
wallet.post("/withdraw", requireAuth, withdraw);

// M-Pesa callbacks (no authentication required - public routes)
wallet.post("/callback", mpesaCallback);
wallet.post("/b2c/result", mpesaB2CResult);
wallet.post("/b2c/timeout", mpesaB2CTimeout);