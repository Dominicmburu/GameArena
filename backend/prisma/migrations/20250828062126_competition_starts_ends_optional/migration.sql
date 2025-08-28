-- AlterTable
ALTER TABLE "public"."Competition" ALTER COLUMN "startsAt" DROP NOT NULL,
ALTER COLUMN "endsAt" DROP NOT NULL;
