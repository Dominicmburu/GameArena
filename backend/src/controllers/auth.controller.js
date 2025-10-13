import crypto from "node:crypto";
import { prisma } from "../prisma.js";
import { hash, compare } from "../utils/crypto.js";
import { sign } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export const signup = async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);
    
    // Check if user already exists
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

    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await prisma.session.create({ 
      data: { 
        userId: user.id, 
        tokenId, 
        expiresAt 
      } 
    });

    const token = sign({ uid: user.id, tokenId });

    res.json({ 
      message: "User created successfully", 
    });
  } catch (e) { 
    next(e); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    console.log("Login attempt for:", email);
    console.log("Password provided:", password ? "Yes" : "No");
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await compare(password, user.passwordHash))) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS", 
        message: "Invalid email or password" 
      });
    }

    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await prisma.session.create({ 
      data: { 
        userId: user.id, 
        tokenId, 
        expiresAt 
      } 
    });

    const token = sign({ uid: user.id, tokenId });
    
    res.cookie("ga_auth", token, { 
      httpOnly: true, 
      secure: env.cookieSecure,
      sameSite: env.cookieSecure ? "none" : "lax", 
      domain: env.cookieDomain || undefined, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/" 
    });

    res.cookie("is_authenticated", "true", { 
      httpOnly: false,  // Can be read by JavaScript
      secure: env.cookieSecure,
      sameSite: env.cookieSecure ? "none" : "lax", 
      domain: env.cookieDomain || undefined, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/" 
    });

    res.json({ 
      id: user.id, 
      email: user.email, 
      username: user.username 
    });
  } catch (e) { 
    next(e); 
  }
};

export const logout = async (req, res) => {
  try {
    // Invalidate session if user is authenticated
    if (req.user?.tokenId) {
      await prisma.session.delete({
        where: { tokenId: req.user.tokenId }
      }).catch(() => {}); // Ignore if session doesn't exist
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
      profile: user.profile,
      wallet: { balance: user.wallet?.balance || 0 }
    });
  } catch (e) {
    next(e);
  }
};