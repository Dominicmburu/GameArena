import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const sign = (payload, ttl = "7d") => jwt.sign(payload, env.jwtSecret, { expiresIn: ttl });

export const verify = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new Error("Invalid token");
  }
};