import { prisma } from "../prisma.js";
import { z } from "zod";
import { env } from "../config/env.js";
import axios from "axios";
import {
  generateSecurityCredential,
  validateCertificate,
  formatPhoneNumber,
  generateTimestamp,
  generatePassword,
  validateAmount,
  generateReference,
  parseCallbackMetadata,
  sanitizeErrorMessage
} from "../utils/mpesaUtils.js";

// Transaction Types
export const TxType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  ENTRY_FEE: "ENTRY_FEE",
  PRIZE: "PRIZE",
  REFUND: "REFUND",
  TRANSFER: "TRANSFER"
};

// Transaction Status (for internal use only - not in DB)
const TxStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REVERSED: "REVERSED",
  CANCELLED: "CANCELLED"
};

/**
 * Get current M-Pesa configuration based on environment
 */
function getCurrentConfig() {
  const config = env.mpesa.isProduction ? env.mpesa.production : env.mpesa.sandbox;
  console.log(`Using M-Pesa ${env.mpesa.env.toUpperCase()} configuration`);
  return config;
}

/**
 * Generate M-Pesa OAuth token with caching
 */
let tokenCache = { token: null, expiresAt: null };

async function generateAccessToken() {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const config = getCurrentConfig();
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      `${config.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 30000
      }
    );

    tokenCache.token = response.data.access_token;
    tokenCache.expiresAt = Date.now() + (50 * 60 * 1000);
    return tokenCache.token;
  } catch (error) {
    console.error('Failed to generate M-Pesa access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa. Please try again.');
  }
}

/**
 * Atomic payment processing with proper field handling
 */
async function processPaymentAtomically(checkoutRequestId, metadata) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock the pending transaction with FOR UPDATE
    const pendingTx = await tx.$queryRaw`
      SELECT * FROM "PendingTransaction" 
      WHERE "checkoutRequestId" = ${checkoutRequestId}
      FOR UPDATE
    `;

    if (!pendingTx || pendingTx.length === 0) {
      throw new Error('Transaction not found');
    }

    const pending = pendingTx[0];
    
    // Convert BigInt fields to regular numbers (Prisma $queryRaw returns BigInts)
    pending.amount = Number(pending.amount);
    if (pending.retryCount) pending.retryCount = Number(pending.retryCount);

    // 2. Check if already processed
    if (pending.status !== TxStatus.PENDING) {
      console.log(`Already processed: ${checkoutRequestId}`);
      return { alreadyProcessed: true, status: pending.status };
    }

    // 3. Check for duplicate mpesaReceiptNumber in meta field
    if (metadata.MpesaReceiptNumber) {
      const duplicate = await tx.transaction.findFirst({
        where: {
          meta: {
            path: ['MpesaReceiptNumber'],
            equals: metadata.MpesaReceiptNumber
          }
        }
      });

      if (duplicate) {
        console.log(`Duplicate receipt detected: ${metadata.MpesaReceiptNumber}`);
        await tx.pendingTransaction.update({
          where: { id: pending.id },
          data: {
            status: TxStatus.COMPLETED,
            mpesaReceiptNumber: metadata.MpesaReceiptNumber,
            completedAt: new Date(),
            failureReason: 'Duplicate transaction - already processed'
          }
        });
        return { alreadyProcessed: true, duplicate: true };
      }
    }

    // 3b. Check by checkoutRequestId in meta (for query-based processing)
    const existingTransaction = await tx.transaction.findFirst({
      where: {
        meta: {
          path: ['checkoutRequestId'],
          equals: checkoutRequestId
        }
      }
    });

    if (existingTransaction) {
      console.log(`Transaction already processed: ${checkoutRequestId}`);
      await tx.pendingTransaction.update({
        where: { id: pending.id },
        data: {
          status: TxStatus.COMPLETED,
          completedAt: new Date()
        }
      });
      return { alreadyProcessed: true, existingTransaction };
    }

    // 4. Get or create wallet
    let wallet = await tx.wallet.findUnique({
      where: { userId: pending.userId }
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId: pending.userId, balance: 0 }
      });
    }

    // 5. Credit wallet
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: pending.amount } }
    });

    // 6. Create transaction record - ALL mpesa data goes in meta
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.DEPOSIT,
        amount: pending.amount,
        meta: {
          ...metadata,
          checkoutRequestId: checkoutRequestId,
          merchantRequestId: pending.merchantRequestId,
          phone: pending.phone,
          status: TxStatus.COMPLETED,
          processedAt: new Date().toISOString()
        }
      }
    });

    // 7. Update pending transaction
    await tx.pendingTransaction.update({
      where: { id: pending.id },
      data: {
        status: TxStatus.COMPLETED,
        mpesaReceiptNumber: metadata.MpesaReceiptNumber || null,
        completedAt: new Date()
      }
    });

    console.log(`✅ Payment processed: CheckoutID=${checkoutRequestId}, User=${pending.userId}, Amount=${pending.amount}, Source=${metadata.source}`);
    if (!metadata.MpesaReceiptNumber) {
      console.log(`⚠️  No M-Pesa receipt yet - will be updated when callback arrives`);
    }

    return {
      success: true,
      transaction,
      newBalance: updatedWallet.balance
    };
  }, {
    maxWait: 10000,
    timeout: 15000,
    isolationLevel: 'Serializable'
  });
}

/**
 * Validate certificate on startup (production only)
 */
export function validateMpesaCertOnStartup() {
  if (!env.mpesa.isProduction) {
    console.log('⚠️  Running in SANDBOX mode - Certificate validation skipped');
    return true;
  }

  const certPath = env.mpesa.production.certPath;
  if (!certPath) {
    console.error('❌ MPESA_CERT_PATH not configured for production');
    return false;
  }

  const validation = validateCertificate(certPath);
  if (!validation.isValid) {
    console.error('❌ M-Pesa certificate validation failed:', validation.error);
    return false;
  }

  console.log('✅ M-Pesa certificate validated successfully');
  return true;
}

/**
 * STK Push for deposits
 */
async function initiateSTKPush(userId, phone, amount, accountReference = null) {
  const config = getCurrentConfig();
  const accessToken = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(config.businessShortCode, config.passkey, timestamp);
  const formattedPhone = formatPhoneNumber(phone);
  const validatedAmount = validateAmount(amount, 'DEPOSIT');
  const reference = accountReference || generateReference('DEPOSIT');

  const requestBody = {
    BusinessShortCode: config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: validatedAmount,
    PartyA: formattedPhone,
    PartyB: config.businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: config.callbackURL,
    AccountReference: reference,
    TransactionDesc: `Wallet Deposit - ${reference}`
  };

  console.log('Initiating STK Push:', { phone: formattedPhone, amount: validatedAmount, reference });

  try {
    const response = await axios.post(
      `${config.baseURL}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('STK Push Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.errorMessage || error.message;
    throw new Error(`STK Push failed: ${sanitizeErrorMessage(errorMsg)}`);
  }
}

/**
 * B2C for withdrawals
 */
async function initiateB2C(userId, phone, amount, commandId = 'BusinessPayment') {
  const config = getCurrentConfig();
  const accessToken = await generateAccessToken();
  const formattedPhone = formatPhoneNumber(phone);
  const validatedAmount = validateAmount(amount, 'WITHDRAWAL');

  let securityCredential;
  if (env.mpesa.isProduction) {
    securityCredential = generateSecurityCredential(
      config.initiatorPassword,
      config.certPath
    );
  } else {
    securityCredential = config.securityCredential;
  }

  const requestBody = {
    InitiatorName: config.initiatorName,
    SecurityCredential: securityCredential,
    CommandID: commandId,
    Amount: validatedAmount,
    PartyA: config.businessShortCode,
    PartyB: formattedPhone,
    Remarks: `Withdrawal for User ${userId}`,
    QueueTimeOutURL: config.queueTimeoutURL,
    ResultURL: config.resultURL,
    Occasion: `WITHDRAWAL-${Date.now()}`
  };

  console.log('Initiating B2C:', { phone: formattedPhone, amount: validatedAmount });

  try {
    const response = await axios.post(
      `${config.baseURL}/mpesa/b2c/v3/paymentrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('B2C Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('B2C Error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.errorMessage || error.message;
    throw new Error(`Withdrawal failed: ${sanitizeErrorMessage(errorMsg)}`);
  }
}

/**
 * Wallet Operations - FIXED to use meta field
 */
async function getOrCreateWallet(userId) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0 }
    });
    console.log(`Created new wallet for user ${userId}`);
  }

  return wallet;
}

async function credit(userId, amount, type = TxType.DEPOSIT, meta = {}) {
  if (amount <= 0) {
    throw Object.assign(
      new Error("Amount must be positive"),
      { status: 400, code: "INVALID_AMOUNT" }
    );
  }

  const wallet = await getOrCreateWallet(userId);

  return await prisma.$transaction(async (tx) => {
    // Check for duplicate transaction by mpesaReceiptId in meta
    if (meta.mpesaReceiptId || meta.MpesaReceiptNumber) {
      const receiptId = meta.mpesaReceiptId || meta.MpesaReceiptNumber;
      const existingTx = await tx.transaction.findFirst({
        where: {
          meta: {
            path: ['MpesaReceiptNumber'],
            equals: receiptId
          }
        }
      });

      if (existingTx) {
        console.log(`Duplicate transaction detected: ${receiptId}`);
        return existingTx;
      }
    }

    // Update wallet balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } }
    });

    // Create transaction record - everything in meta
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        meta: {
          ...meta,
          status: TxStatus.COMPLETED,
          completedAt: new Date().toISOString()
        }
      }
    });

    console.log(`Credited ${amount} to user ${userId}. New balance: ${wallet.balance + amount}`);
    return transaction;
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}

async function debit(userId, amount, type = TxType.ENTRY_FEE, meta = {}) {
  if (amount <= 0) {
    throw Object.assign(
      new Error("Amount must be positive"),
      { status: 400, code: "INVALID_AMOUNT" }
    );
  }

  const wallet = await getOrCreateWallet(userId);

  if (wallet.balance < amount) {
    throw Object.assign(
      new Error("Insufficient funds"),
      { status: 400, code: "INSUFFICIENT_FUNDS" }
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Update wallet balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } }
    });

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        meta: {
          ...meta,
          status: TxStatus.COMPLETED,
          completedAt: new Date().toISOString()
        }
      }
    });

    console.log(`Debited ${amount} from user ${userId}. New balance: ${wallet.balance - amount}`);
    return transaction;
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}

export const WalletOps = { getOrCreateWallet, credit, debit };

/**
 * API Handlers
 */

// Get wallet balance
export const getBalance = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const wallet = await getOrCreateWallet(uid);

    res.json({
      balance: wallet.balance,
      currency: 'KES',
      lastUpdated: wallet.updatedAt
    });
  } catch (e) {
    next(e);
  }
};

// Get transaction history
export const getTransactions = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await getOrCreateWallet(uid);

    const whereClause = { walletId: wallet.id };
    if (type) whereClause.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (e) {
    next(e);
  }
};

// Validation schemas
const depositSchema = z.object({
  phone: z.string()
    .min(9, "Phone number too short")
    .max(13, "Phone number too long")
    .regex(/^(\+?254|0)?[71]\d{8}$/, "Invalid Kenyan phone number"),
  amount: z.number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive")
    .min(1, "Minimum amount is KES 1")
    .max(150000, "Maximum amount is KES 150,000")
});

const withdrawSchema = z.object({
  amount: z.number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive")
    .min(10, "Minimum withdrawal is KES 10")
    .max(70000, "Maximum withdrawal is KES 70,000"),
  phone: z.string()
    .min(9, "Phone number too short")
    .max(13, "Phone number too long")
    .regex(/^(\+?254|0)?[71]\d{8}$/, "Invalid Kenyan phone number")
});

// Deposit handler
export const deposit = async (req, res, next) => {
  try {
    const { phone, amount } = depositSchema.parse(req.body);
    const uid = req.user.uid;

    // Check for recent pending transactions
    const recentPending = await prisma.pendingTransaction.findFirst({
      where: {
        userId: uid,
        status: TxStatus.PENDING,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (recentPending) {
      return res.status(400).json({
        error: "You have a pending transaction. Please complete or wait for it to expire.",
        checkoutRequestId: recentPending.checkoutRequestId,
        code: "PENDING_TRANSACTION_EXISTS"
      });
    }

    // Initiate STK Push
    const mpesaResponse = await initiateSTKPush(uid, phone, amount);

    if (mpesaResponse.ResponseCode === "0") {
      const pendingTx = await prisma.pendingTransaction.create({
        data: {
          userId: uid,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          merchantRequestId: mpesaResponse.MerchantRequestID,
          phone: formatPhoneNumber(phone),
          amount: validateAmount(amount, 'DEPOSIT'),
          type: TxType.DEPOSIT,
          status: TxStatus.PENDING,
          retryCount: 0
        }
      });

      console.log(`STK Push initiated for user ${uid}: ${mpesaResponse.CheckoutRequestID}`);

      res.json({
        success: true,
        message: "STK Push sent to your phone. Please enter your M-Pesa PIN to complete the payment.",
        data: {
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          merchantRequestId: mpesaResponse.MerchantRequestID,
          transactionId: pendingTx.id
        }
      });
    } else {
      throw new Error(mpesaResponse.ResponseDescription || "STK Push failed");
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error: e.errors[0].message,
        code: "VALIDATION_ERROR"
      });
    }
    next(e);
  }
};

// Withdrawal handler
export const withdraw = async (req, res, next) => {
  try {
    const { amount, phone } = withdrawSchema.parse(req.body);
    const uid = req.user.uid;

    // Check wallet balance
    const wallet = await getOrCreateWallet(uid);
    if (wallet.balance < amount) {
      return res.status(400).json({
        error: "Insufficient funds",
        code: "INSUFFICIENT_FUNDS",
        available: wallet.balance,
        required: amount
      });
    }

    // Check for recent B2C transactions
    const recentB2C = await prisma.b2CTransaction.findFirst({
      where: {
        userId: uid,
        status: TxStatus.PENDING,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000)
        }
      }
    });

    if (recentB2C) {
      return res.status(400).json({
        error: "You have a pending withdrawal. Please wait for it to complete.",
        code: "PENDING_WITHDRAWAL_EXISTS"
      });
    }

    // Initiate B2C transfer
    const mpesaResponse = await initiateB2C(uid, phone, amount);

    if (mpesaResponse.ResponseCode === "0") {
      // Create B2C transaction record first
      const b2cTx = await prisma.b2CTransaction.create({
        data: {
          userId: uid,
          phone: formatPhoneNumber(phone),
          amount: validateAmount(amount, 'WITHDRAWAL'),
          conversationId: mpesaResponse.ConversationID,
          originatorConversationId: mpesaResponse.OriginatorConversationID,
          status: TxStatus.PENDING
        }
      });

      // Debit user's wallet and create transaction
      const transaction = await debit(uid, amount, TxType.WITHDRAWAL, {
        method: "M-PESA",
        phone: formatPhoneNumber(phone),
        direction: "B2C",
        originatorConversationId: mpesaResponse.OriginatorConversationID,
        conversationId: mpesaResponse.ConversationID,
        b2cTransactionId: b2cTx.id
      });

      // Link transaction to B2C record
      await prisma.b2CTransaction.update({
        where: { id: b2cTx.id },
        data: { transactionId: transaction.id }
      });

      console.log(`Withdrawal initiated for user ${uid}: ${mpesaResponse.ConversationID}`);

      res.json({
        success: true,
        message: "Withdrawal initiated successfully. You will receive the funds shortly.",
        data: {
          conversationId: mpesaResponse.ConversationID,
          transactionId: transaction.id,
          amount: amount
        }
      });
    } else {
      throw new Error(mpesaResponse.ResponseDescription || "B2C transfer failed");
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error: e.errors[0].message,
        code: "VALIDATION_ERROR"
      });
    }

    if (e.code === 'P2025') {
      console.error('Critical error after wallet debit:', e);
    }

    next(e);
  }
};


export const checkDepositStatus = async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.params;
    const uid = req.user.uid;

    const pendingTx = await prisma.pendingTransaction.findFirst({
      where: {
        checkoutRequestId,
        userId: uid
      }
    });

    if (!pendingTx) {
      return res.status(404).json({
        error: "Transaction not found",
        code: "TRANSACTION_NOT_FOUND"
      });
    }

    // If already completed/failed/expired, return status immediately
    if (pendingTx.status !== 'PENDING') {
      return res.json({
        status: pendingTx.status,
        amount: pendingTx.amount,
        mpesaReceiptNumber: pendingTx.mpesaReceiptNumber,
        failureReason: pendingTx.failureReason,
        completedAt: pendingTx.completedAt
      });
    }

    // Query M-Pesa for status
    const config = getCurrentConfig();
    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(config.businessShortCode, config.passkey, timestamp);

    try {
      const response = await axios.post(
        `${config.baseURL}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: config.businessShortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;

      // ✅ ONLY process clear success
      if (result.ResultCode === '0') {
        try {
          const metadata = {
            MpesaReceiptNumber: null,
            TransactionDate: new Date().toISOString(),
            PhoneNumber: pendingTx.phone,
            Amount: pendingTx.amount,
            method: "M-PESA",
            source: "QUERY",
            note: "Processed via query - receipt will be updated when callback arrives"
          };

          const processResult = await processPaymentAtomically(checkoutRequestId, metadata);

          if (processResult.alreadyProcessed) {
            return res.json({
              status: 'COMPLETED',
              amount: pendingTx.amount,
              message: "Payment already processed"
            });
          }

          return res.json({
            status: 'COMPLETED',
            amount: pendingTx.amount,
            completedAt: new Date()
          });

        } catch (error) {
          console.error('Error processing payment in query:', error);
          return res.json({
            status: 'PENDING',
            message: "Payment received, processing..."
          });
        }
      }
      // ✅ User explicitly cancelled - mark as CANCELLED (not FAILED)
      else if (result.ResultCode === '1032') {
        await prisma.pendingTransaction.update({
          where: { id: pendingTx.id },
          data: {
            status: 'FAILED', // Keep as FAILED in DB (we only have PENDING/COMPLETED/FAILED/EXPIRED)
            failureReason: 'User cancelled the transaction',
            completedAt: new Date()
          }
        });

        return res.json({
          status: 'CANCELLED',
          resultDesc: result.ResultDesc,
          amount: pendingTx.amount
        });
      }
      // ⚠️ CRITICAL FIX: ResultCode 1037 (timeout) - KEEP AS PENDING
      else if (result.ResultCode === '1037') {
        // Just update last checked time, DON'T mark as failed
        await prisma.pendingTransaction.update({
          where: { id: pendingTx.id },
          data: {
            lastCheckedAt: new Date(),
            retryCount: { increment: 1 }
          }
        });

        return res.json({
          status: 'PENDING',
          message: "Waiting for payment confirmation. Please complete the payment on your phone.",
          resultDesc: result.ResultDesc,
          amount: pendingTx.amount
        });
      }
      // ⚠️ Any other error - KEEP AS PENDING, let callback decide
      else {
        await prisma.pendingTransaction.update({
          where: { id: pendingTx.id },
          data: {
            lastCheckedAt: new Date(),
            retryCount: { increment: 1 },
            failureReason: result.ResultDesc // Store reason but don't change status yet
          }
        });

        return res.json({
          status: 'PENDING',
          message: "Waiting for payment confirmation...",
          resultDesc: result.ResultDesc,
          amount: pendingTx.amount
        });
      }

    } catch (error) {
      console.error('STK Query Error:', error.response?.data || error.message);
      
      // On query error, keep as pending
      return res.json({
        status: 'PENDING',
        message: "Unable to verify transaction status. Please try again."
      });
    }
  } catch (e) {
    next(e);
  }
};


export const mpesaCallback = async (req, res) => {
  try {
    console.log("📩 M-Pesa STK Callback Received:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.error("Invalid callback structure");
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }

    const { stkCallback } = Body;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Store callback for audit
    await prisma.mpesaCallback.create({
      data: {
        transactionType: 'STK',
        merchantRequestId,
        checkoutRequestId,
        resultCode,
        resultDesc,
        callbackMetadata: stkCallback.CallbackMetadata || {},
        processed: false
      }
    });

    // ✅ Payment successful
    if (resultCode === 0) {
      const metadata = parseCallbackMetadata(stkCallback.CallbackMetadata?.Item || []);

      const paymentMetadata = {
        MpesaReceiptNumber: metadata.MpesaReceiptNumber,
        TransactionDate: metadata.TransactionDate,
        PhoneNumber: metadata.PhoneNumber,
        Amount: metadata.Amount,
        method: "M-PESA",
        checkoutRequestId,
        merchantRequestId,
        source: "CALLBACK"
      };

      try {
        // 🔍 Check current status BEFORE processing
        const currentTx = await prisma.pendingTransaction.findFirst({
          where: { checkoutRequestId }
        });

        if (!currentTx) {
          console.log(`⚠️ No pending transaction found for ${checkoutRequestId}`);
          return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
        }

        // 🚨 RESCUE LOGIC: If marked as FAILED recently, allow override
        if (currentTx.status === 'FAILED') {
          const failedAgo = Date.now() - new Date(currentTx.completedAt || currentTx.updatedAt).getTime();
          const threeMinutes = 3 * 60 * 1000;

          if (failedAgo < threeMinutes) {
            console.log(`🔄 RESCUING prematurely failed transaction: ${checkoutRequestId}`);
            console.log(`   - Was marked failed ${Math.round(failedAgo / 1000)}s ago`);
            console.log(`   - Callback says SUCCESS - overriding to COMPLETED`);
            
            // Reset status to PENDING so it can be processed
            await prisma.pendingTransaction.update({
              where: { id: currentTx.id },
              data: {
                status: 'PENDING',
                failureReason: null
              }
            });
          } else {
            console.log(`⚠️ Transaction was failed too long ago (${Math.round(failedAgo / 1000)}s), not rescuing`);
            await prisma.mpesaCallback.updateMany({
              where: { checkoutRequestId },
              data: { processed: true, processedAt: new Date() }
            });
            return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
          }
        }

        // ✅ If already COMPLETED, just update the receipt number
        if (currentTx.status === 'COMPLETED') {
          console.log(`Transaction already completed, updating receipt number: ${metadata.MpesaReceiptNumber}`);
          
          // Update PendingTransaction with receipt
          await prisma.pendingTransaction.update({
            where: { id: currentTx.id },
            data: {
              mpesaReceiptNumber: metadata.MpesaReceiptNumber
            }
          });

          // Find and update the main Transaction record
          const mainTransaction = await prisma.transaction.findFirst({
            where: {
              meta: {
                path: ['checkoutRequestId'],
                equals: checkoutRequestId
              }
            }
          });

          if (mainTransaction) {
            const existingMeta = mainTransaction.meta || {};
            
            await prisma.transaction.update({
              where: { id: mainTransaction.id },
              data: {
                meta: {
                  ...existingMeta,
                  MpesaReceiptNumber: metadata.MpesaReceiptNumber,
                  TransactionDate: metadata.TransactionDate,
                  updatedByCallback: true,
                  callbackReceivedAt: new Date().toISOString()
                }
              }
            });
            
            console.log(`✅ Updated completed transaction with M-Pesa receipt: ${metadata.MpesaReceiptNumber}`);
          }

          // Mark callback as processed
          await prisma.mpesaCallback.updateMany({
            where: { checkoutRequestId },
            data: { processed: true, processedAt: new Date() }
          });

          return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
        }

        // 💰 Process the payment (for PENDING transactions)
        const result = await processPaymentAtomically(checkoutRequestId, paymentMetadata);

        // Mark callback as processed
        await prisma.mpesaCallback.updateMany({
          where: { checkoutRequestId },
          data: { processed: true, processedAt: new Date() }
        });

        if (result.alreadyProcessed) {
          console.log(`Callback received but payment already processed during query: ${checkoutRequestId}`);
          
          // Still update receipt if available
          if (result.existingTransaction && metadata.MpesaReceiptNumber) {
            const existingMeta = result.existingTransaction.meta || {};
            
            if (!existingMeta.MpesaReceiptNumber) {
              console.log(`Updating query-processed transaction with receipt: ${metadata.MpesaReceiptNumber}`);
              
              await prisma.transaction.update({
                where: { id: result.existingTransaction.id },
                data: {
                  meta: {
                    ...existingMeta,
                    ...paymentMetadata,
                    updatedByCallback: true,
                    callbackReceivedAt: new Date().toISOString()
                  }
                }
              });
              
              await prisma.pendingTransaction.updateMany({
                where: { checkoutRequestId },
                data: { mpesaReceiptNumber: metadata.MpesaReceiptNumber }
              });
              
              console.log(`✅ Updated transaction with M-Pesa receipt`);
            }
          }
        } else {
          console.log(`💰 Deposit completed via callback: ${metadata.MpesaReceiptNumber}`);
        }

      } catch (error) {
        console.error(`❌ Error processing callback payment:`, error);

        await prisma.mpesaCallback.updateMany({
          where: { checkoutRequestId },
          data: {
            processed: true,
            processedAt: new Date(),
            resultDesc: `Processing error: ${error.message}`
          }
        });
      }

    } 
    // ❌ Payment failed - NOW we can mark as FAILED (callback is authoritative)
    else {
      console.log(`❌ Payment failed via callback: ${resultDesc} (Code: ${resultCode})`);

      try {
        await prisma.pendingTransaction.updateMany({
          where: { checkoutRequestId },
          data: {
            status: 'FAILED',
            failureReason: `${resultDesc} (Code: ${resultCode})`,
            completedAt: new Date()
          }
        });

        await prisma.mpesaCallback.updateMany({
          where: { checkoutRequestId },
          data: { processed: true, processedAt: new Date() }
        });
        
        console.log(`Transaction marked as FAILED by callback`);
      } catch (error) {
        console.error('Error updating failed transaction:', error);
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("❌ M-Pesa callback error:", error);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

export const mpesaB2CResult = async (req, res) => {
  try {
    console.log("📩 M-Pesa B2C Result Callback:", JSON.stringify(req.body, null, 2));

    const { Result } = req.body;

    if (!Result) {
      console.error("Invalid B2C callback structure");
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }

    const { ResultCode, ResultDesc, ConversationID, OriginatorConversationID } = Result;

    // Store callback
    await prisma.mpesaCallback.create({
      data: {
        transactionType: 'B2C',
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        callbackMetadata: Result,
        processed: false
      }
    });

    // Find B2C transaction
    const b2cTx = await prisma.b2CTransaction.findUnique({
      where: { conversationId: ConversationID }
    });

    if (!b2cTx) {
      console.log(`⚠️  B2C transaction not found: ${ConversationID}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    }

    if (ResultCode === 0) {
      // B2C successful
      const resultParameters = Result.ResultParameters?.ResultParameter || [];
      const metadata = parseCallbackMetadata(resultParameters);

      const transactionId = metadata.TransactionID;
      const transactionAmount = metadata.TransactionAmount || b2cTx.amount;
      const recipientRegistered = metadata.B2CRecipientIsRegisteredCustomer;

      console.log(`✅ B2C completed: ${transactionId}, Amount: KES ${transactionAmount}`);

      // Update B2C transaction
      await prisma.b2CTransaction.update({
        where: { id: b2cTx.id },
        data: {
          status: TxStatus.COMPLETED,
          mpesaReceiptId: transactionId,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          completedAt: new Date()
        }
      });

      // Update main transaction if linked
      if (b2cTx.transactionId) {
        const existingTx = await prisma.transaction.findUnique({
          where: { id: b2cTx.transactionId }
        });
        
        if (existingTx) {
          await prisma.transaction.update({
            where: { id: b2cTx.transactionId },
            data: {
              meta: {
                ...existingTx.meta,
                status: TxStatus.COMPLETED,
                mpesaReceiptId: transactionId,
                recipientRegistered,
                b2cCompletedAt: new Date().toISOString()
              }
            }
          });
        }
      }

      await prisma.mpesaCallback.updateMany({
        where: { 
          transactionType: 'B2C',
          callbackMetadata: { 
            path: ['Result', 'ConversationID'], 
            equals: ConversationID 
          } 
        },
        data: { processed: true, processedAt: new Date() }
      });

      console.log(`💸 Withdrawal completed for user ${b2cTx.userId}: KES ${transactionAmount}`);

    } else {
      // B2C failed - refund user wallet
      console.log(`❌ B2C failed: ${ResultDesc}`);

      await prisma.b2CTransaction.update({
        where: { id: b2cTx.id },
        data: {
          status: TxStatus.FAILED,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          completedAt: new Date()
        }
      });

      // Refund the wallet
      await credit(b2cTx.userId, b2cTx.amount, TxType.REFUND, {
        reason: "B2C withdrawal failed",
        originalConversationId: ConversationID,
        failureReason: ResultDesc,
        refundedAt: new Date().toISOString()
      });

      // Update main transaction
      if (b2cTx.transactionId) {
        const existingTx = await prisma.transaction.findUnique({
          where: { id: b2cTx.transactionId }
        });
        
        if (existingTx) {
          await prisma.transaction.update({
            where: { id: b2cTx.transactionId },
            data: {
              meta: {
                ...existingTx.meta,
                status: TxStatus.REVERSED,
                reversed: true,
                reversalReason: ResultDesc,
                reversedAt: new Date().toISOString()
              }
            }
          });
        }
      }

      console.log(`🔄 Refunded user ${b2cTx.userId}: KES ${b2cTx.amount}`);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("❌ B2C result handler error:", error);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// B2C Timeout Callback
export const mpesaB2CTimeout = async (req, res) => {
  try {
    console.log("⏱️  M-Pesa B2C Timeout:", JSON.stringify(req.body, null, 2));

    await prisma.mpesaCallback.create({
      data: {
        transactionType: 'B2C_TIMEOUT',
        resultCode: -1,
        resultDesc: 'Request timeout',
        callbackMetadata: req.body
      }
    });

    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("B2C timeout handler error:", error);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
};

// Get pending transactions
export const getPendingTransactions = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const pending = await prisma.pendingTransaction.findMany({
      where: {
        userId: uid,
        status: TxStatus.PENDING
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ pending });
  } catch (e) {
    next(e);
  }
};