import crypto from "node:crypto";
import { prisma } from "../prisma.js";
import { hash, compare } from "./crypto.js";

export const CODE_TTL_MS = 15 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_ATTEMPTS = 5;

export const generateCode = () => {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
};

export const issueVerificationCode = async (userId) => {
  const code = generateCode();
  const codeHash = await hash(code);

  await prisma.emailVerificationCode.deleteMany({ where: { userId } });

  await prisma.emailVerificationCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return code;
};

export const verifyCode = async (userId, submittedCode) => {
  const record = await prisma.emailVerificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "NO_CODE" };

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } });
    return { ok: false, reason: "EXPIRED" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  const match = await compare(String(submittedCode), record.codeHash);
  if (!match) {
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "INVALID" };
  }

  await prisma.emailVerificationCode.delete({ where: { id: record.id } });
  return { ok: true };
};

export const getLatestCodeRecord = async (userId) => {
  return prisma.emailVerificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
