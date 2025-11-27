import { customAlphabet } from "nanoid";
import { prisma } from "../prisma.js";

const nanoId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

/**
 * Generates a unique short code with collision detection
 * @param {number} maxRetries - Maximum retry attempts (default: 5)
 * @returns {Promise<string>} Unique code
 * @throws {Error} If unable to generate unique code after max retries
 */
export const shortCode = async (maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = nanoId();
    
    // Check for collisions in both Competition and Invite tables
    const [competitionExists, inviteExists] = await Promise.all([
      prisma.competition.findUnique({ where: { code }, select: { id: true } }),
      prisma.invite.findUnique({ where: { code }, select: { id: true } })
    ]);
    
    if (!competitionExists && !inviteExists) {
      return code;
    }
    
    console.warn(`Code collision detected: ${code} (attempt ${attempt + 1}/${maxRetries})`);
  }
  
  throw new Error("Unable to generate unique code after maximum retries");
};

/**
 * Synchronous code generator (use only when collision check isn't critical)
 * ⚠️ WARNING: Does not check for collisions
 */
export const shortCodeSync = () => nanoId();