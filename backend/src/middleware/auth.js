import { verify } from "../utils/jwt.js";
import { prisma } from "../prisma.js";

const COOKIE_NAMES = ["ga_auth", "session"]; // accept either; keep "ga_auth" as primary

function extractToken(req) {
  // 1) Cookies
  for (const name of COOKIE_NAMES) {
    const v = req.cookies?.[name];
    if (v) return v;
  }
  // 2) Authorization: Bearer <token>
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  // 3) Optional headers / query (helpful for some clients/socket handshakes)
  if (req.headers["x-session-token"]) return String(req.headers["x-session-token"]);
  if (req.query?.token) return String(req.query.token);

  return null;
}

export async function requireAuth(req, res, next) {
  try {
    // Allow CORS preflight through
    if (req.method === "OPTIONS") return next();

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
    }

    let decoded;
    try {
      decoded = verify(token); // should include decoded.tokenId
    } catch {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid token" });
    }

    if (!decoded?.tokenId) {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Malformed token" });
    }

    const session = await prisma.session.findUnique({
      where: { tokenId: decoded.tokenId },
      include: { User: true },
    });

    if (!session) {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Session not found" });
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "Session expired" });
    }

    // Attach auth context
    req.user = {
      uid: session.userId,
      tokenId: decoded.tokenId,
      userData: session.User,
    };
    req.session = {
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };

    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid token" });
  }
}







