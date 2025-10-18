-- AlterTable
ALTER TABLE "public"."Competition" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 hour';

-- AlterTable
ALTER TABLE "public"."PendingTransaction" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."B2CTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "conversationId" TEXT NOT NULL,
    "originatorConversationId" TEXT,
    "mpesaReceiptId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resultCode" INTEGER,
    "resultDesc" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "B2CTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MpesaCallback" (
    "id" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "merchantRequestId" TEXT,
    "checkoutRequestId" TEXT,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT,
    "callbackMetadata" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MpesaCallback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "B2CTransaction_conversationId_key" ON "public"."B2CTransaction"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "B2CTransaction_transactionId_key" ON "public"."B2CTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "B2CTransaction_userId_idx" ON "public"."B2CTransaction"("userId");

-- CreateIndex
CREATE INDEX "B2CTransaction_conversationId_idx" ON "public"."B2CTransaction"("conversationId");

-- CreateIndex
CREATE INDEX "B2CTransaction_status_idx" ON "public"."B2CTransaction"("status");

-- CreateIndex
CREATE INDEX "B2CTransaction_status_createdAt_idx" ON "public"."B2CTransaction"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MpesaCallback_checkoutRequestId_idx" ON "public"."MpesaCallback"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "MpesaCallback_merchantRequestId_idx" ON "public"."MpesaCallback"("merchantRequestId");

-- CreateIndex
CREATE INDEX "MpesaCallback_transactionType_idx" ON "public"."MpesaCallback"("transactionType");

-- CreateIndex
CREATE INDEX "MpesaCallback_processed_idx" ON "public"."MpesaCallback"("processed");

-- CreateIndex
CREATE INDEX "MpesaCallback_processed_transactionType_idx" ON "public"."MpesaCallback"("processed", "transactionType");

-- AddForeignKey
ALTER TABLE "public"."B2CTransaction" ADD CONSTRAINT "B2CTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."B2CTransaction" ADD CONSTRAINT "B2CTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
