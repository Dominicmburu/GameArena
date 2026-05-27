import crypto from "node:crypto";
import { prisma } from "../prisma.js";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const issuePasswordResetToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  return rawToken;
};

export const consumePasswordResetToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, reason: "INVALID" };
  }

  const tokenHash = hashToken(rawToken);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return { ok: false, reason: "INVALID" };
  if (record.usedAt) return { ok: false, reason: "USED" };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "EXPIRED" };
  }

  return { ok: true, userId: record.userId, recordId: record.id };
};

export const markTokenUsed = async (recordId) => {
  await prisma.passwordResetToken.update({
    where: { id: recordId },
    data: { usedAt: new Date() },
  });
};

export const getLatestResetRequest = async (userId) => {
  return prisma.passwordResetToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
