import { prisma } from "../prisma.js";
import { verify } from "../utils/jwt.js";

export function registerSockets(io) {
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verify(token);

      // Verify session exists and is not expired
      const session = await prisma.session.findUnique({
        where: { tokenId: decoded.tokenId },
        include: { User: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      socket.userId = session.userId;
      socket.user = session.User;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.username} connected with socket ${socket.id}`);

    socket.on("subscribe:competition", async (code) => {
      try {
        const competition = await prisma.competition.findUnique({
          where: { code: code.toUpperCase() },
          include: { players: true }
        });

        if (!competition) {
          socket.emit("error", { message: "Competition not found" });
          return;
        }

        // Check if user is a participant
        const isParticipant = competition.players.some(p => p.userId === socket.userId);
        if (!isParticipant && competition.privacy === "PRIVATE") {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        socket.join(`comp:${code.toUpperCase()}`);
        socket.emit("subscribed", { competition: code.toUpperCase() });
      } catch (error) {
        socket.emit("error", { message: "Failed to subscribe to competition" });
      }
    });

    socket.on("score:update", async ({ code, score }) => {
      try {
        if (typeof score !== 'number' || score < 0) {
          socket.emit("error", { message: "Invalid score" });
          return;
        }

        const competition = await prisma.competition.findUnique({
          where: { code: code.toUpperCase() }
        });

        if (!competition) {
          socket.emit("error", { message: "Competition not found" });
          return;
        }

        if (competition.status !== "ONGOING") {
          socket.emit("error", { message: "Competition is not active" });
          return;
        }

        const updated = await prisma.competitionPlayer.updateMany({
          where: {
            competitionId: competition.id,
            userId: socket.userId
          },
          data: { score }
        });

        if (updated.count === 0) {
          socket.emit("error", { message: "You are not a participant in this competition" });
          return;
        }

        // Get updated leaderboard
        const leaderboard = await prisma.competitionPlayer.findMany({
          where: { competitionId: competition.id },
          orderBy: { score: "desc" },
          take: 20,
          include: { User: { select: { username: true } } }
        });

        const formattedLeaderboard = leaderboard.map((p, i) => ({
          rank: i + 1,
          username: p.User.username,
          score: p.score,
          isReady: p.isReady
        }));

        // Broadcast to all subscribers
        io.to(`comp:${code.toUpperCase()}`).emit("leaderboard:update", {
          competition: code.toUpperCase(),
          leaderboard: formattedLeaderboard,
          timestamp: new Date().toISOString()
        });

        socket.emit("score:updated", { score, rank: formattedLeaderboard.findIndex(p => p.username === socket.user.username) + 1 });
      } catch (error) {
        console.error("Error updating score:", error);
        socket.emit("error", { message: "Failed to update score" });
      }
    });

    socket.on("ready:toggle", async ({ code }) => {
      try {
        const competition = await prisma.competition.findUnique({
          where: { code: code.toUpperCase() }
        });

        if (!competition) {
          socket.emit("error", { message: "Competition not found" });
          return;
        }

        if (competition.status !== "UPCOMING") {
          socket.emit("error", { message: "Competition has already started" });
          return;
        }

        // Toggle ready status
        const currentPlayer = await prisma.competitionPlayer.findFirst({
          where: {
            competitionId: competition.id,
            userId: socket.userId
          }
        });

        if (!currentPlayer) {
          socket.emit("error", { message: "You are not a participant in this competition" });
          return;
        }

        const newReadyStatus = !currentPlayer.isReady;

        await prisma.competitionPlayer.updateMany({
          where: {
            competitionId: competition.id,
            userId: socket.userId
          },
          data: { isReady: newReadyStatus }
        });

        // Get updated counts
        const totalPlayers = await prisma.competitionPlayer.count({
          where: { competitionId: competition.id }
        });

        const readyPlayers = await prisma.competitionPlayer.count({
          where: { competitionId: competition.id, isReady: true }
        });

        // Start competition if all players are ready and there are at least 2 players
        if (totalPlayers >= 2 && readyPlayers === totalPlayers) {
          await prisma.competition.update({
            where: { id: competition.id },
            data: { status: "ONGOING" }
          });

          io.to(`comp:${code.toUpperCase()}`).emit("competition:started", {
            competition: code.toUpperCase(),
            message: "Competition has started!"
          });
        }

        // Broadcast ready status update
        io.to(`comp:${code.toUpperCase()}`).emit("ready:update", {
          competition: code.toUpperCase(),
          readyCount: readyPlayers,
          totalPlayers: totalPlayers,
          user: socket.user.username,
          isReady: newReadyStatus
        });

      } catch (error) {
        console.error("Error toggling ready status:", error);
        socket.emit("error", { message: "Failed to update ready status" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user.username} disconnected: ${reason}`);
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user.username}:`, error);
    });
  });

  // Handle io errors
  io.on("error", (error) => {
    console.error("Socket.io error:", error);
  });
}
