-- CreateIndex
CREATE INDEX "Competition_privacy_status_createdAt_idx" ON "public"."Competition"("privacy", "status", "createdAt");
