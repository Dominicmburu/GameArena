import { verify } from "../utils/jwt.js";
import { prisma } from "../prisma.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies["ga_auth"];
    
    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
    }

    const decoded = verify(token);
    
    // Verify session exists and is not expired
    const session = await prisma.session.findUnique({
      where: { tokenId: decoded.tokenId },
      include: { User: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Session expired" });
    }

    req.user = {
      uid: session.userId,
      tokenId: decoded.tokenId,
      userData: session.User
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid token" });
  }
}