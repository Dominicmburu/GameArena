/*
  Warnings:

  - You are about to drop the column `isReady` on the `CompetitionPlayer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."CompetitionPlayer" DROP COLUMN "isReady",
ADD COLUMN     "hasPlayed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Invite" ADD COLUMN     "inviteeUsername" TEXT;

-- CreateTable
CREATE TABLE "public"."FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "public"."FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playedWithId" TEXT NOT NULL,
    "competitionId" TEXT,
    "gameType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_idx" ON "public"."FriendRequest"("senderId");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_idx" ON "public"."FriendRequest"("receiverId");

-- CreateIndex
CREATE INDEX "FriendRequest_status_idx" ON "public"."FriendRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "public"."FriendRequest"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "GameHistory_userId_idx" ON "public"."GameHistory"("userId");

-- CreateIndex
CREATE INDEX "GameHistory_playedWithId_idx" ON "public"."GameHistory"("playedWithId");

-- CreateIndex
CREATE INDEX "GameHistory_userId_playedWithId_idx" ON "public"."GameHistory"("userId", "playedWithId");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_competitionId_hasPlayed_idx" ON "public"."CompetitionPlayer"("competitionId", "hasPlayed");

-- CreateIndex
CREATE INDEX "Invite_inviteeUsername_idx" ON "public"."Invite"("inviteeUsername");

-- AddForeignKey
ALTER TABLE "public"."FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameHistory" ADD CONSTRAINT "GameHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
