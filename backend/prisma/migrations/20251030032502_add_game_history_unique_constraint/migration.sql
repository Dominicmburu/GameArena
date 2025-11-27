/*
  Warnings:

  - A unique constraint covering the columns `[userId,playedWithId,competitionId]` on the table `GameHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameHistory_userId_playedWithId_competitionId_key" ON "public"."GameHistory"("userId", "playedWithId", "competitionId");
