/*
  Warnings:

  - You are about to drop the column `endsAt` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `minutesToPlay` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `maxPlayTime` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `minPlayTime` on the `Game` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Competition_status_startsAt_idx";

-- AlterTable
ALTER TABLE "public"."Competition" DROP COLUMN "endsAt",
DROP COLUMN "minutesToPlay",
DROP COLUMN "startsAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
ALTER COLUMN "status" SET DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "public"."Game" DROP COLUMN "maxPlayTime",
DROP COLUMN "minPlayTime";

-- CreateIndex
CREATE INDEX "Competition_status_expiresAt_idx" ON "public"."Competition"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Competition_expiresAt_idx" ON "public"."Competition"("expiresAt");
