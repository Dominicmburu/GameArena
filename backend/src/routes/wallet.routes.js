import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { 
  getBalance, 
  deposit, 
  withdraw, 
  getTransactions,
  mpesaCallback,
  mpesaB2CResult,
  querySTKStatus
} from "../controllers/wallet.controller.js";

export const wallet = Router();

// Protected routes (require authentication)
wallet.use("/balance", requireAuth);
wallet.use("/transactions", requireAuth);
wallet.use("/deposit", requireAuth);
wallet.use("/withdraw", requireAuth);
wallet.use("/query", requireAuth);

wallet.get("/balance", getBalance);
wallet.get("/transactions", getTransactions);
wallet.post("/deposit", deposit);
wallet.post("/withdraw", withdraw);
wallet.get("/query/:checkoutRequestId", querySTKStatus);

// M-Pesa webhook endpoints (no auth required - called by Safaricom)
export const mpesaWebhooks = Router();

mpesaWebhooks.post("/callback", mpesaCallback);
mpesaWebhooks.post("/b2c-result", mpesaB2CResult);
mpesaWebhooks.post("/timeout", (req, res) => {
  // Handle M-Pesa timeout
  console.log("M-Pesa timeout received:", req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});

// Export both routers
export { wallet as default };