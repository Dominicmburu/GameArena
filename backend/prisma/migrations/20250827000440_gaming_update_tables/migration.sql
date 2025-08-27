/*
  Warnings:

  - You are about to drop the column `level` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `gameType` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPlayTime` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPlayTime` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."GameType" AS ENUM ('ACTION', 'ADVENTURE', 'PUZZLE', 'STRATEGY', 'RACING', 'SPORTS', 'RPG', 'SIMULATION', 'ARCADE', 'TRIVIA', 'CARD', 'BOARD');

-- AlterTable
ALTER TABLE "public"."Competition" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gameType" "public"."GameType" NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" "public"."Level" NOT NULL,
ADD COLUMN     "maxPlayTime" INTEGER NOT NULL,
ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "minPlayTime" INTEGER NOT NULL,
ADD COLUMN     "minPlayers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Competition_gameId_idx" ON "public"."Competition"("gameId");

-- CreateIndex
CREATE INDEX "Competition_status_idx" ON "public"."Competition"("status");

-- CreateIndex
CREATE INDEX "Competition_creatorId_idx" ON "public"."Competition"("creatorId");
