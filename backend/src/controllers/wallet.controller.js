import { prisma } from "../prisma.js";
import { z } from "zod";
import { env } from "../config/env.js";
import axios from "axios";

const TxType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL", 
  ENTRY_FEE: "ENTRY_FEE",
  PRIZE: "PRIZE",
  REFUND: "REFUND",
  TRANSFER: "TRANSFER"
};

// M-Pesa Configuration
const MPESA_CONFIG = {
  sandbox: {
    baseURL: "https://sandbox.safaricom.co.ke",
    consumerKey: env.mpesa.consumerKey,
    consumerSecret: env.mpesa.consumerSecret,
    businessShortCode: env.mpesa.businessShortCode,
    passkey: env.mpesa.passkey, 
    callbackURL: env.mpesa.callbackURL,
    queueTimeoutURL: env.mpesa.queueTimeoutURL,
    resultURL: env.mpesa.resultURL
  },
  live: {
    baseURL: "https://api.safaricom.co.ke",
    consumerKey: env.mpesa.liveConsumerKey,
    consumerSecret: env.mpesa.liveConsumerSecret,
    businessShortCode: env.mpesa.liveBusinessShortCode,
    passkey: env.mpesa.livePasskey,
    callbackURL: env.mpesa.liveCallbackURL,
    queueTimeoutURL: env.mpesa.liveQueueTimeoutURL,
    resultURL: env.mpesa.liveResultURL
  }
};

const getCurrentConfig = () => {
  return env.mpesa.env === "sandbox" ? MPESA_CONFIG.sandbox : MPESA_CONFIG.live;
};


// Generate M-Pesa access token
async function generateAccessToken() {
  const config = getCurrentConfig();
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  
  try {
    const response = await axios.get(`${config.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to generate M-Pesa access token: ${error.message}`);
  }
}

// Generate timestamp for M-Pesa
function generateTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate M-Pesa password
function generatePassword(businessShortCode, passkey, timestamp) {
  const str = businessShortCode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
}

// Format phone number for M-Pesa (ensure it starts with 254)
function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  phone = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (phone.startsWith('254')) {
    return phone;
  } else if (phone.startsWith('0')) {
    return '254' + phone.substring(1);
  } else if (phone.startsWith('7') || phone.startsWith('1')) {
    return '254' + phone;
  }
  
  throw new Error('Invalid phone number format');
}

// STK Push for deposits
async function initiateSTKPush(phone, amount, accountReference = 'Wallet Deposit') {
  const config = getCurrentConfig();
  console.log("Using M-Pesa config:", config);
  const accessToken = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(config.businessShortCode, config.passkey, timestamp);
  const formattedPhone = formatPhoneNumber(phone);
  
  const requestBody = {
    BusinessShortCode: config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: config.businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: config.callbackURL,
    AccountReference: accountReference,
    TransactionDesc: "Wallet Deposit"
  };
  
  try {
    const response = await axios.post(
      `${config.baseURL}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`);
  }
}

// B2C for withdrawals
async function initiateB2C(phone, amount, commandId = 'BusinessPayment') {
  const config = getCurrentConfig();
  const accessToken = await generateAccessToken();
  const formattedPhone = formatPhoneNumber(phone);
  
  // Generate security credential (you'll need to implement this based on your certificate)
  const securityCredential = await generateSecurityCredential();
  
  const requestBody = {
    InitiatorName: env.mpesa.initiatorName,
    SecurityCredential: securityCredential,
    CommandID: commandId, // BusinessPayment, SalaryPayment, or PromotionPayment
    Amount: amount,
    PartyA: config.businessShortCode,
    PartyB: formattedPhone,
    Remarks: "Wallet Withdrawal",
    QueueTimeOutURL: config.queueTimeoutURL,
    ResultURL: config.resultURL,
    Occasion: "Withdrawal"
  };
  
  try {
    const response = await axios.post(
      `${config.baseURL}/mpesa/b2c/v1/paymentrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(`B2C request failed: ${error.response?.data?.errorMessage || error.message}`);
  }
}

// Security credential generation (you'll need your production certificate)
async function generateSecurityCredential() {
  // In production, you need to encrypt your initiator password using Safaricom's public certificate
  // This is a placeholder - implement based on your certificate
  if (env.mpesa.env === "sandbox") {
    return env.mpesa.securityCredential || "Safaricom999!*!";
  }
  
  // For production, use the actual encryption with the certificate
  throw new Error("Production security credential generation not implemented");
}

// Existing wallet functions (unchanged)
async function getOrCreateWallet(userId) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId } });
  }
  return wallet;
}

async function credit(userId, amount, type = "DEPOSIT", meta = {}) {
  if (amount <= 0) {
    throw Object.assign(new Error("Amount must be positive"), { status: 400, code: "INVALID_AMOUNT" });
  }
  
  const wallet = await getOrCreateWallet(userId);
  
  return await prisma.$transaction(async (tx) => {
    await tx.wallet.update({ 
      where: { id: wallet.id }, 
      data: { balance: { increment: amount } }
    });
    
    return await tx.transaction.create({ 
      data: { 
        walletId: wallet.id,
        type, 
        amount, 
        meta 
      } 
    });
  });
}

async function debit(userId, amount, type = "ENTRY_FEE", meta = {}) {
  if (amount <= 0) {
    throw Object.assign(new Error("Amount must be positive"), { status: 400, code: "INVALID_AMOUNT" });
  }
  
  const wallet = await getOrCreateWallet(userId);
  
  if (wallet.balance < amount) {
    throw Object.assign(new Error("Insufficient funds"), { status: 400, code: "INSUFFICIENT_FUNDS" });
  }
  
  return await prisma.$transaction(async (tx) => {
    await tx.wallet.update({ 
      where: { id: wallet.id }, 
      data: { balance: { decrement: amount } }
    });
    
    return await tx.transaction.create({ 
      data: { 
        walletId: wallet.id,
        type, 
        amount, 
        meta 
      } 
    });
  });
}

export const WalletOps = { getOrCreateWallet, credit, debit };

// Existing handlers (unchanged)
export const getBalance = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const wallet = await getOrCreateWallet(uid);
    res.json({ balance: wallet.balance });
  } catch (e) {
    next(e);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20 } = req.query;
    
    const wallet = await getOrCreateWallet(uid);
    
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    
    res.json(transactions);
  } catch (e) {
    next(e);
  }
};

const depositSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
  amount: z.number().int().positive("Amount must be positive").min(1).max(150000)
});

// Updated deposit handler with real M-Pesa integration
export const deposit = async (req, res, next) => {
  try {
    const { phone, amount } = depositSchema.parse(req.body);
    const uid = req.user.uid;
    
    // Initiate STK Push
    const mpesaResponse = await initiateSTKPush(phone, amount);
    
    if (mpesaResponse.ResponseCode === "0") {
      // Store pending transaction
      await prisma.pendingTransaction.create({
        data: {
          userId: uid,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          merchantRequestId: mpesaResponse.MerchantRequestID,
          phone,
          amount,
          type: TxType.DEPOSIT,
          status: 'PENDING'
        }
      });
      
      res.json({ 
        ok: true, 
        message: "STK Push sent successfully",
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        merchantRequestId: mpesaResponse.MerchantRequestID
      });
    } else {
      throw new Error(mpesaResponse.ResponseDescription || "STK Push failed");
    }
  } catch (e) { 
    next(e); 
  }
};

const withdrawSchema = z.object({
  amount: z.number().int().positive("Amount must be positive").min(1).max(150000),
  phone: z.string().min(10, "Valid phone number required")
});

// Updated withdrawal handler with real M-Pesa integration
export const withdraw = async (req, res, next) => {
  try {
    const { amount, phone } = withdrawSchema.parse(req.body);
    const uid = req.user.uid;
    
    // Check if user has sufficient balance
    const wallet = await getOrCreateWallet(uid);
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        error: "Insufficient funds",
        code: "INSUFFICIENT_FUNDS" 
      });
    }

    // Initiate B2C transfer
    const mpesaResponse = await initiateB2C(phone, amount);
    
    if (mpesaResponse.ResponseCode === "0") {
      // Debit user's wallet
      await debit(uid, amount, TxType.WITHDRAWAL, { 
        method: "M-PESA", 
        phone, 
        direction: "B2C",
        originatorConversationId: mpesaResponse.OriginatorConversationID,
        conversationId: mpesaResponse.ConversationID
      });
      
      res.json({ 
        ok: true,
        message: "Withdrawal initiated successfully",
        conversationId: mpesaResponse.ConversationID
      });
    } else {
      throw new Error(mpesaResponse.ResponseDescription || "B2C transfer failed");
    }
  } catch (e) { 
    next(e); 
  }
};

// M-Pesa callback handlers
export const mpesaCallback = async (req, res, next) => {
  try {

    console.log("📩 M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;
    
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    
    // Find the pending transaction
    const pendingTx = await prisma.pendingTransaction.findFirst({
      where: { checkoutRequestId }
    });
    
    if (!pendingTx) {
      console.log(`Pending transaction not found for CheckoutRequestID: ${checkoutRequestId}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }
    
    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;
      
      const mpesaReceiptNumber = items.find(item => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionDate = items.find(item => item.Name === "TransactionDate")?.Value;
      const phoneNumber = items.find(item => item.Name === "PhoneNumber")?.Value;
      
      // Credit user's wallet
      await credit(pendingTx.userId, pendingTx.amount, TxType.DEPOSIT, {
        method: "M-PESA",
        phone: phoneNumber,
        mpesaReceiptNumber,
        transactionDate,
        checkoutRequestId,
        merchantRequestId
      });
      
      // Update pending transaction
      await prisma.pendingTransaction.update({
        where: { id: pendingTx.id },
        data: { 
          status: 'COMPLETED',
          mpesaReceiptNumber,
          completedAt: new Date()
        }
      });
      
      console.log(`Deposit completed for user ${pendingTx.userId}: KES ${pendingTx.amount}`);
    } else {
      // Payment failed
      await prisma.pendingTransaction.update({
        where: { id: pendingTx.id },
        data: { 
          status: 'FAILED',
          failureReason: resultDesc,
          completedAt: new Date()
        }
      });
      
      console.log(`Deposit failed for user ${pendingTx.userId}: ${resultDesc}`);
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    console.error("📩 Raw body:", JSON.stringify(req.body, null, 2));
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// B2C result handler
export const mpesaB2CResult = async (req, res, next) => {
  try {
    const { Result } = req.body;
    const { ResultCode, ResultDesc, ConversationID, OriginatorConversationID } = Result;
    
    console.log(`B2C Result: ${ResultDesc} (Code: ${ResultCode})`);
    
    if (ResultCode === 0) {
      // B2C successful
      const resultParameters = Result.ResultParameters?.ResultParameter || [];
      const transactionId = resultParameters.find(param => param.Key === "TransactionID")?.Value;
      const transactionAmount = resultParameters.find(param => param.Key === "TransactionAmount")?.Value;
      const b2cRecipientIsRegisteredCustomer = resultParameters.find(param => param.Key === "B2CRecipientIsRegisteredCustomer")?.Value;
      
      console.log(`B2C completed: TransactionID ${transactionId}, Amount: KES ${transactionAmount}`);
    } else {
      // B2C failed - you might want to credit back the user's wallet
      console.error(`B2C failed: ${ResultDesc}`);
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("B2C result handler error:", error);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// Query STK Push status
export const querySTKStatus = async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.params;
    const config = getCurrentConfig();
    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(config.businessShortCode, config.passkey, timestamp);
    
    const requestBody = {
      BusinessShortCode: config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };
    
    const response = await axios.post(
      `${config.baseURL}/mpesa/stkpushquery/v1/query`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};