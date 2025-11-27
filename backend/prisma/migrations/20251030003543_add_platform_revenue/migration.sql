-- CreateTable
CREATE TABLE "public"."PlatformRevenue" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "privacy" "public"."Privacy" NOT NULL,
    "feePercentage" DOUBLE PRECISION NOT NULL,
    "entryFee" INTEGER NOT NULL,
    "playersJoined" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformRevenue_competitionId_idx" ON "public"."PlatformRevenue"("competitionId");

-- CreateIndex
CREATE INDEX "PlatformRevenue_createdAt_idx" ON "public"."PlatformRevenue"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformRevenue_privacy_idx" ON "public"."PlatformRevenue"("privacy");

-- AddForeignKey
ALTER TABLE "public"."PlatformRevenue" ADD CONSTRAINT "PlatformRevenue_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
