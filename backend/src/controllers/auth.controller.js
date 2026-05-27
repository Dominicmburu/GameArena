import crypto from "node:crypto";
import { prisma } from "../prisma.js";
import { hash, compare } from "../utils/crypto.js";
import { sign } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { z } from "zod";
import { sendVerificationCodeEmail, sendPasswordResetEmail } from "../utils/email.js";
import {
  issueVerificationCode,
  verifyCode,
  getLatestCodeRecord,
  RESEND_COOLDOWN_MS,
} from "../utils/verification.js";
import {
  issuePasswordResetToken,
  consumePasswordResetToken,
  getLatestResetRequest,
  RESET_REQUEST_COOLDOWN_MS,
} from "../utils/passwordReset.js";

const signupSchema = z.object({
  email: z.string().email("Invalid email format").max(254, "Email is too long"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or fewer")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const verifySchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

const resendSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32, "Invalid reset token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const setAuthCookies = (res, token) => {
  res.cookie("ga_auth", token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    domain: env.cookieDomain || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });

  res.cookie("is_authenticated", "true", {
    httpOnly: false,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    domain: env.cookieDomain || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

const createSessionForUser = async (userId) => {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenId, expiresAt } });
  return sign({ uid: userId, tokenId });
};

export const signup = async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "USER_EXISTS",
        message: existingUser.email === body.email ? "Email already registered" : "Username already taken"
      });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash: await hash(body.password),
        profile: { create: {} },
        wallet: { create: {} },
      },
    });

    const code = await issueVerificationCode(user.id);
    await sendVerificationCodeEmail({ to: user.email, code, username: user.username });

    res.json({
      message: "Account created. Check your email for a verification code.",
      requiresVerification: true,
      email: user.email,
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await compare(password, user.passwordHash))) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "EMAIL_NOT_VERIFIED",
        message: "Please confirm your email address to continue.",
        email: user.email,
      });
    }

    const token = await createSessionForUser(user.id);
    setAuthCookies(res, token);

    res.json({
      id: user.id,
      email: user.email,
      username: user.username
    });
  } catch (e) {
    next(e);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = verifySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        error: "INVALID_CODE",
        message: "Invalid or expired code",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: "ALREADY_VERIFIED",
        message: "This email is already verified. Please sign in.",
      });
    }

    const result = await verifyCode(user.id, code);

    if (!result.ok) {
      const messages = {
        NO_CODE: "No active code. Please request a new one.",
        EXPIRED: "This code has expired. Please request a new one.",
        TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Please request a new code.",
        INVALID: "Invalid code. Please try again.",
      };
      return res.status(400).json({
        error: result.reason,
        message: messages[result.reason] || "Invalid or expired code",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    const token = await createSessionForUser(user.id);
    setAuthCookies(res, token);

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      verified: true,
    });
  } catch (e) {
    next(e);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = resendSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    const genericResponse = {
      message: "If an unverified account exists for that email, a new code has been sent.",
    };

    if (!user || user.emailVerified) {
      return res.json(genericResponse);
    }

    const latest = await getLatestCodeRecord(user.id);
    if (latest) {
      const elapsed = Date.now() - latest.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          error: "RATE_LIMITED",
          message: `Please wait ${retryAfter}s before requesting another code.`,
          retryAfter,
        });
      }
    }

    const code = await issueVerificationCode(user.id);
    await sendVerificationCodeEmail({ to: user.email, code, username: user.username });

    res.json(genericResponse);
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const genericResponse = {
      message: "If an account with that email exists, a reset link has been sent.",
    };

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json(genericResponse);
    }

    const latest = await getLatestResetRequest(user.id);
    if (latest) {
      const elapsed = Date.now() - latest.createdAt.getTime();
      if (elapsed < RESET_REQUEST_COOLDOWN_MS) {
        const retryAfter = Math.ceil((RESET_REQUEST_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          error: "RATE_LIMITED",
          message: `Please wait ${retryAfter}s before requesting another reset link.`,
          retryAfter,
        });
      }
    }

    const rawToken = await issuePasswordResetToken(user.id);
    const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      username: user.username,
    });

    res.json(genericResponse);
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const result = await consumePasswordResetToken(token);

    if (!result.ok) {
      const messages = {
        INVALID: "This reset link is invalid.",
        USED: "This reset link has already been used. Please request a new one.",
        EXPIRED: "This reset link has expired. Please request a new one.",
      };
      return res.status(400).json({
        error: result.reason,
        message: messages[result.reason] || "Invalid reset link",
      });
    }

    const passwordHash = await hash(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: result.userId },
        data: {
          passwordHash,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: result.recordId },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: result.userId } }),
    ]);

    res.json({
      message: "Password updated successfully. Please sign in with your new password.",
    });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user?.tokenId) {
      await prisma.session.delete({
        where: { tokenId: req.user.tokenId }
      }).catch(() => {});
    }

    res.clearCookie("ga_auth", { path: "/", domain: env.cookieDomain });
    res.clearCookie("is_authenticated", { path: "/", domain: env.cookieDomain });
    res.json({ ok: true });
  } catch (error) {
    res.clearCookie("ga_auth", { path: "/", domain: env.cookieDomain });
    res.clearCookie("is_authenticated", { path: "/", domain: env.cookieDomain });
    res.json({ ok: true });
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        profile: true,
        wallet: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      profile: user.profile,
      wallet: { balance: user.wallet?.balance || 0 }
    });
  } catch (e) {
    next(e);
  }
};
