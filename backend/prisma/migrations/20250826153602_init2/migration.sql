-- CreateEnum
CREATE TYPE "public"."PendingTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."PendingTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."TxType" NOT NULL,
    "status" "public"."PendingTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "mpesaReceiptNumber" TEXT,
    "failureReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingTransaction_checkoutRequestId_key" ON "public"."PendingTransaction"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "PendingTransaction_checkoutRequestId_idx" ON "public"."PendingTransaction"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "PendingTransaction_userId_idx" ON "public"."PendingTransaction"("userId");

-- CreateIndex
CREATE INDEX "PendingTransaction_status_idx" ON "public"."PendingTransaction"("status");

-- AddForeignKey
ALTER TABLE "public"."PendingTransaction" ADD CONSTRAINT "PendingTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
