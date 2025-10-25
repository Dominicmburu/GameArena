/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `endsAt` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startsAt` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Competition_expiresAt_idx";

-- DropIndex
DROP INDEX "public"."Competition_status_expiresAt_idx";

-- AlterTable
ALTER TABLE "public"."Competition" DROP COLUMN "expiresAt",
ADD COLUMN     "endsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

-- CreateIndex
CREATE INDEX "Competition_status_endsAt_idx" ON "public"."Competition"("status", "endsAt");

-- CreateIndex
CREATE INDEX "Competition_endsAt_idx" ON "public"."Competition"("endsAt");

-- CreateIndex
CREATE INDEX "Competition_startsAt_idx" ON "public"."Competition"("startsAt");

-- CreateIndex
CREATE INDEX "Competition_status_startsAt_idx" ON "public"."Competition"("status", "startsAt");
