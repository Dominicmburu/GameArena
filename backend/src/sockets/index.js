import { prisma } from "../prisma.js";
import { verify } from "../utils/jwt.js";

export function registerSockets(io) {
  const userSockets = new Map();

  // Enhanced authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error('AUTH_NO_COOKIES'));
      }

      // Robust cookie parsing
      const parseCookies = (cookieString) => {
        return cookieString
          .split(';')
          .reduce((acc, cookie) => {
            const [name, ...valueParts] = cookie.trim().split('=');
            if (name && valueParts.length > 0) {
              acc[name] = decodeURIComponent(valueParts.join('='));
            }
            return acc;
          }, {});
      };

      const parsedCookies = parseCookies(cookies);
      const token = parsedCookies['ga_auth'];

      if (!token) {
        console.log('❌ No ga_auth token. Available cookies:', Object.keys(parsedCookies));
        return next(new Error('AUTH_NO_TOKEN'));
      }

      // Verify JWT token
      let decoded;
      try {
        decoded = verify(token);
      } catch (err) {
        console.error('Token verification failed:', err.message);
        return next(new Error('AUTH_INVALID_TOKEN'));
      }

      // Verify session in database
      const session = await prisma.session.findUnique({
        where: { tokenId: decoded.tokenId },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      if (!session) {
        return next(new Error('AUTH_SESSION_NOT_FOUND'));
      }

      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await prisma.session.delete({
          where: { id: session.id }
        }).catch(console.error);

        return next(new Error('AUTH_SESSION_EXPIRED'));
      }

      // Attach user data to socket
      socket.userId = session.userId;
      socket.user = session.User;
      socket.sessionId = session.id;

      console.log(`✓ Socket authenticated: ${session.User.username} (${socket.id})`);
      next();

    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('AUTH_INTERNAL_ERROR'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✓ User ${socket.user.username} connected (${socket.id})`);

    // Store socket mapping
    userSockets.set(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);

    // Send connection confirmation
    socket.emit("connected", {
      userId: socket.userId,
      username: socket.user.username,
      timestamp: new Date().toISOString()
    });

    // COMPETITION EVENTS
    socket.on("subscribe:competition", async (code) => {
      try {
        console.log(`[SUBSCRIBE] User ${socket.user.username} attempting to subscribe to ${code}`);

        const competition = await prisma.competition.findUnique({
          where: { code: code.toUpperCase() },
          include: {
            players: {
              include: {
                User: { select: { id: true, username: true } }
              }
            },
            creator: { select: { id: true, username: true } }
          }
        });

        if (!competition) {
          console.log(`❌ [SUBSCRIBE] Competition ${code} not found`);
          socket.emit("error", {
            message: "Competition not found",
            code: "COMPETITION_NOT_FOUND"
          });
          return;
        }

        // Check if user is participant OR creator
        const isParticipant = competition.players.some(p => p.userId === socket.userId);
        const isCreator = competition.creatorId === socket.userId;

        console.log(`[SUBSCRIBE] User ${socket.user.username} - isParticipant: ${isParticipant}, isCreator: ${isCreator}, privacy: ${competition.privacy}`);

        // Allow if:
        // 1. User is a participant
        // 2. User is the creator
        // 3. Competition is PUBLIC
        if (!isParticipant && !isCreator && competition.privacy === "PRIVATE") {
          console.log(`❌ [SUBSCRIBE] Access denied for ${socket.user.username} to private competition ${code}`);
          // socket.emit("error", { 
          //   message: "Access denied to private competition",
          //   code: "ACCESS_DENIED"
          // });
          return;
        }

        console.log(`${!isParticipant, isCreator, competition.privacy} access granted for ${socket.user.username} to competition ${code}`);

        // Join the room
        socket.join(`comp:${code.toUpperCase()}`);
        socket.emit("subscribed", {
          competition: code.toUpperCase(),
          role: isCreator ? 'creator' : isParticipant ? 'participant' : 'viewer'
        });

        console.log(`✓ [SUBSCRIBE] User ${socket.user.username} subscribed to competition ${code}`);
      } catch (error) {
        console.error("❌ [SUBSCRIBE] Error:", error);
        socket.emit("error", {
          message: "Failed to subscribe to competition",
          code: "SUBSCRIBE_ERROR"
        });
      }
    });

    socket.on("unsubscribe:competition", (code) => {
      socket.leave(`comp:${code.toUpperCase()}`);
      socket.emit("unsubscribed", { competition: code.toUpperCase() });
      console.log(`User ${socket.user.username} unsubscribed from competition ${code}`);
    });

    socket.on("score:update", async ({ code, score, playTime }) => {
      try {
        if (typeof score !== 'number' || score < 0) {
          socket.emit("error", { message: "Invalid score" });
          return;
        }

        const competition = await prisma.competition.findUnique({
          where: { code: code.toUpperCase() },
          include: {
            creator: { select: { id: true, username: true } },
            game: { select: { minPlayTime: true, maxPlayTime: true } },
            players: true
          }
        });

        if (!competition) {
          socket.emit("error", { message: "Competition not found" });
          return;
        }

        if (competition.status !== "ONGOING" && competition.status !== "UPCOMING") {
          socket.emit("error", { message: "Competition is not active" });
          return;
        }

        // Check if user is a participant
        const player = competition.players.find(p => p.userId === socket.userId);
        if (!player) {
          socket.emit("error", { message: "You are not a participant in this competition" });
          return;
        }

        // Basic anti-cheat validation for play time
        if (playTime) {
          const minTime = competition.game.minPlayTime * 60;
          const maxTime = competition.game.maxPlayTime * 60 * 2;

          if (playTime < minTime) {
            socket.emit("error", { message: "Game completed too quickly" });
            return;
          }

          if (playTime > maxTime) {
            socket.emit("error", { message: "Game took too long" });
            return;
          }
        }

        await prisma.competitionPlayer.update({
          where: { id: player.id },
          data: {
            score,
            hasPlayed: true,
            playedAt: new Date()
          }
        });

        // Get updated leaderboard
        const leaderboard = await prisma.competitionPlayer.findMany({
          where: { competitionId: competition.id },
          orderBy: { score: "desc" },
          include: { User: { select: { username: true } } }
        });

        const formattedLeaderboard = leaderboard.map((p, i) => ({
          rank: i + 1,
          username: p.User.username,
          score: p.score,
          hasPlayed: p.hasPlayed
        }));

        const userRank = formattedLeaderboard.findIndex(p => p.username === socket.user.username) + 1;

        // Broadcast to all competition subscribers
        io.to(`comp:${code.toUpperCase()}`).emit("leaderboard:update", {
          competition: code.toUpperCase(),
          leaderboard: formattedLeaderboard,
          timestamp: new Date().toISOString()
        });

        // Notify competition creator if it's not the current user
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
          rank: userRank,
          totalPlayers: leaderboard.length
        });

        // Check if all players have completed
        const allPlayers = await prisma.competitionPlayer.findMany({
          where: { competitionId: competition.id }
        });

        const completedPlayers = allPlayers.filter(p => p.hasPlayed).length;
        if (completedPlayers === allPlayers.length && allPlayers.length >= 1) {
          console.log(`✓ All players completed competition ${code}`);
        }

      } catch (error) {
        console.error("Error updating score:", error);
        socket.emit("error", { message: "Failed to update score" });
      }
    });

    // SOCIAL EVENTS - Handle joining competitions
    socket.on("join:competition", async ({ competitionId, playerUsername }) => {
      try {
        const competition = await prisma.competition.findUnique({
          where: { id: competitionId },
          include: { creator: { select: { id: true } } }
        });

        if (competition && competition.creator.id !== socket.userId) {
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
        io.to(`user:${senderId}`).emit("friend_request_accepted", {
          acceptedBy: { username: accepterUsername },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error handling friend request accepted:", error);
      }
    });

    socket.on("friend_request:declined", async ({ requestId, senderId, declinerUsername }) => {
      try {
        io.to(`user:${senderId}`).emit("friend_request_declined", {
          declinedBy: { username: declinerUsername },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error handling friend request declined:", error);
      }
    });

    // Real-time chat/messaging
    socket.on("message:send", async ({ toUserId, message, competitionId }) => {
      try {
        if (!message || message.trim().length === 0) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        const trimmedMessage = message.trim().substring(0, 500);

        io.to(`user:${toUserId}`).emit("message:receive", {
          from: {
            id: socket.userId,
            username: socket.user.username
          },
          message: trimmedMessage,
          competitionId: competitionId,
          timestamp: new Date().toISOString()
        });

        socket.emit("message:sent", {
          toUserId,
          message: trimmedMessage,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Competition chat
    socket.on("competition:message", async ({ code, message }) => {
      try {
        if (!message || message.trim().length === 0) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        const trimmedMessage = message.trim().substring(0, 500);

        io.to(`comp:${code.toUpperCase()}`).emit("competition:message", {
          from: {
            id: socket.userId,
            username: socket.user.username
          },
          message: trimmedMessage,
          competitionCode: code.toUpperCase(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Error sending competition message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user.username} disconnected: ${reason}`);
      userSockets.delete(socket.userId);

      // Leave all rooms
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

  // Helper functions
  io.userSockets = userSockets;

  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
    return userSockets.has(userId);
  };

  io.isUserConnected = (userId) => userSockets.has(userId);
  io.getConnectedUserCount = () => userSockets.size;

  io.on("error", (error) => {
    console.error("Socket.io server error:", error);
  });

  console.log("✓ Socket server initialized with httpOnly cookie authentication");
}