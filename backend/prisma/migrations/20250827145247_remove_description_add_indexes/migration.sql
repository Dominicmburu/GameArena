/*
  Warnings:

  - You are about to drop the column `description` on the `Competition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Competition" DROP COLUMN "description";

-- CreateIndex
CREATE INDEX "Competition_privacy_status_idx" ON "public"."Competition"("privacy", "status");

-- CreateIndex
CREATE INDEX "Competition_status_startsAt_idx" ON "public"."Competition"("status", "startsAt");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_userId_idx" ON "public"."CompetitionPlayer"("userId");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_competitionId_score_idx" ON "public"."CompetitionPlayer"("competitionId", "score");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_competitionId_rank_idx" ON "public"."CompetitionPlayer"("competitionId", "rank");

-- CreateIndex
CREATE INDEX "Game_gameType_idx" ON "public"."Game"("gameType");

-- CreateIndex
CREATE INDEX "Game_level_idx" ON "public"."Game"("level");

-- CreateIndex
CREATE INDEX "Game_isActive_isPopular_idx" ON "public"."Game"("isActive", "isPopular");

-- CreateIndex
CREATE INDEX "Invite_competitionId_idx" ON "public"."Invite"("competitionId");

-- CreateIndex
CREATE INDEX "Invite_inviterId_idx" ON "public"."Invite"("inviterId");

-- CreateIndex
CREATE INDEX "Invite_inviteeId_idx" ON "public"."Invite"("inviteeId");

-- CreateIndex
CREATE INDEX "Invite_code_idx" ON "public"."Invite"("code");

-- CreateIndex
CREATE INDEX "Match_competitionId_idx" ON "public"."Match"("competitionId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "public"."Match"("status");

-- CreateIndex
CREATE INDEX "TrainingSession_userId_idx" ON "public"."TrainingSession"("userId");

-- CreateIndex
CREATE INDEX "TrainingSession_gameName_idx" ON "public"."TrainingSession"("gameName");

-- CreateIndex
CREATE INDEX "Transaction_walletId_type_idx" ON "public"."Transaction"("walletId", "type");

-- CreateIndex
CREATE INDEX "Transaction_type_createdAt_idx" ON "public"."Transaction"("type", "createdAt");
