import { prisma } from "../prisma.js";
import { verify } from "../utils/jwt.js";

export function registerSockets(io) {
  // Store user socket mappings
  const userSockets = new Map();

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

    // Store user socket mapping for direct notifications
    userSockets.set(socket.userId, socket.id);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // COMPETITION EVENTS
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
          where: { code: code.toUpperCase() },
          include: {
            creator: { select: { id: true, username: true } },
            game: { select: { minPlayTime: true, maxPlayTime: true } }
          }
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
          data: { score, hasPlayed: true, playedAt: new Date() }
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
          hasPlayed: p.hasPlayed
        }));

        // Broadcast to all subscribers
        io.to(`comp:${code.toUpperCase()}`).emit("leaderboard:update", {
          competition: code.toUpperCase(),
          leaderboard: formattedLeaderboard,
          timestamp: new Date().toISOString()
        });

        // Notify competition creator
        if (competition.creator.id !== socket.userId) {
          io.to(`user:${competition.creator.id}`).emit("score_submitted", {
            competitionId: competition.id,
            competitionTitle: competition.title,
            competitionCode: competition.code,
            player: socket.user.username,
            score: score,
            timestamp: new Date().toISOString()
          });
        }

        socket.emit("score:updated", {
          score,
          rank: formattedLeaderboard.findIndex(p => p.username === socket.user.username) + 1
        });
      } catch (error) {
        console.error("Error updating score:", error);
        socket.emit("error", { message: "Failed to update score" });
      }
    });

    // SOCIAL EVENTS

    // Handle joining competitions
    socket.on("join:competition", async ({ competitionId, playerUsername }) => {
      try {
        const competition = await prisma.competition.findUnique({
          where: { id: competitionId },
          include: { creator: { select: { id: true } } }
        });

        if (competition && competition.creator.id !== socket.userId) {
          // Notify competition creator
          io.to(`user:${competition.creator.id}`).emit("competition_joined", {
            competitionId: competition.id,
            competitionTitle: competition.title,
            competitionCode: competition.code,
            player: playerUsername,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Error handling competition join:", error);
      }
    });

    // Handle invite events
    socket.on("invite:sent", async ({ inviteId, inviteeId, competitionData, inviterUsername }) => {
      try {
        // Notify the invitee
        io.to(`user:${inviteeId}`).emit("new_invite", {
          invite: {
            id: inviteId,
            competition: competitionData,
            inviter: { username: inviterUsername },
            createdAt: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error("Error handling invite sent:", error);
      }
    });

    socket.on("invite:accepted", async ({ inviteId, inviterId, accepterUsername }) => {
      try {
        // Notify the inviter
        io.to(`user:${inviterId}`).emit("invite_accepted", {
          inviteId,
          acceptedBy: { username: accepterUsername },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error handling invite accepted:", error);
      }
    });

    socket.on("invite:declined", async ({ inviteId, inviterId, declinerUsername }) => {
      try {
        // Notify the inviter
        io.to(`user:${inviterId}`).emit("invite_declined", {
          inviteId,
          decliner: declinerUsername,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error handling invite declined:", error);
      }
    });

    // Handle friend request events
    socket.on("friend_request:sent", async ({ requestId, receiverId, senderUsername }) => {
      try {
        // Notify the receiver
        io.to(`user:${receiverId}`).emit("new_friend_request", {
          request: {
            id: requestId,
            from: { username: senderUsername, id: socket.userId },
            createdAt: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error("Error handling friend request sent:", error);
      }
    });

    socket.on("friend_request:accepted", async ({ requestId, senderId, accepterUsername }) => {
      try {
        // Notify the sender
        io.to(`user:${senderId}`).emit("friend_request_accepted", {
          acceptedBy: { username: accepterUsername },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error handling friend request accepted:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user.username} disconnected: ${reason}`);
      userSockets.delete(socket.userId);

      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user.username}:`, error);
    });
  });

  // Make userSockets available for direct access
  io.userSockets = userSockets;

  // Helper function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(`user:${userId}`).emit(event, data);
      return true;
    }
    return false;
  };

  io.on("error", (error) => {
    console.error("Socket.io error:", error);
  });
}