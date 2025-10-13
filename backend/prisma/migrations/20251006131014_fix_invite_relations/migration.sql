-- AlterTable
ALTER TABLE "public"."Wallet" ALTER COLUMN "balance" SET DEFAULT 2000;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
