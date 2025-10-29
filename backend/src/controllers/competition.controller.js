import { prisma } from "../prisma.js";
import { z } from "zod";
import { shortCode } from "../utils/id.js";
import { WalletOps } from "./wallet.controller.js";

// Helper function to calculate platform fee based on privacy
function calculatePlatformFee(entryFee, privacy) {
  const feePercentage = privacy === "PRIVATE" ? 0.15 : 0.20;
  return Math.floor(entryFee * feePercentage);
}

export const listMine = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const competitions = await prisma.competition.findMany({
      where: { creatorId: uid },
      include: {
        game: {
          select: {
            name: true,
            gameType: true,
            level: true,
            minPlayers: true,
            maxPlayers: true,
            imageUrl: true
          }
        },
        players: {
          include: {
            User: { select: { username: true } }
          },
          orderBy: { score: 'desc' }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedCompetitions = competitions.map(c => {
      const userPlayer = c.players.find(p => p.userId === uid);
      const playedCount = c.players.filter(p => p.hasPlayed).length;
      const currentRank = userPlayer ? c.players.filter(p => p.hasPlayed).findIndex(p => p.userId === uid) + 1 : null;

      return {
        id: c.id,
        code: c.code,
        title: c.title,
        privacy: c.privacy,
        status: c.status,
        maxPlayers: c.maxPlayers,
        currentPlayers: c.players.length,
        playedCount: playedCount,
        entryFee: c.entryFee,
        totalPrizePool: c.totalPrizePool,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        currentRank: currentRank,
        gameLevel: c.game.level.toLowerCase(),
        finalRank: userPlayer?.rank || null,
        finalScore: userPlayer?.score || null,
        hasPlayed: userPlayer?.hasPlayed || false,
        earnings: 0,
        totalPlayers: c.players.length,
        Game: {
          name: c.game.name,
          gameType: c.game.gameType,
          level: c.game.level,
          playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
          imageUrl: c.game.imageUrl
        },
        players: c.players.map(p => ({
          id: p.id,
          username: p.User.username,
          score: p.score,
          hasPlayed: p.hasPlayed,
          playedAt: p.playedAt,
          rank: p.rank
        }))
      };
    });

    res.json(formattedCompetitions);
  } catch (e) {
    next(e);
  }
};

export const listPublic = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, gameType, gameLevel } = req.query;

    const where = {
      privacy: "PUBLIC",
      ...(status && { status }),
      ...(gameType && { game: { gameType } }),
      ...(gameLevel && { game: { level: gameLevel } })
    };

    const competitions = await prisma.competition.findMany({
      where,
      include: {
        game: {
          select: {
            name: true,
            gameType: true,
            level: true,
            minPlayers: true,
            maxPlayers: true,
            imageUrl: true
          }
        },
        players: {
          include: {
            User: { select: { username: true } }
          },
          orderBy: { score: 'desc' }
        },
        creator: { select: { username: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const formattedCompetitions = competitions.map(c => {
      const playedCount = c.players.filter(p => p.hasPlayed).length;

      return {
        id: c.id,
        code: c.code,
        title: c.title,
        privacy: c.privacy,
        status: c.status,
        maxPlayers: c.maxPlayers,
        currentPlayers: c.players.length,
        playedCount: playedCount,
        entryFee: c.entryFee,
        totalPrizePool: c.totalPrizePool,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        creator: c.creator.username,
        gameLevel: c.game.level.toLowerCase(),
        totalPlayers: c.players.length,
        Game: {
          name: c.game.name,
          gameType: c.game.gameType,
          level: c.game.level,
          playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
          imageUrl: c.game.imageUrl
        },
        players: c.players.map(p => ({
          id: p.id,
          username: p.User.username,
          score: p.score,
          hasPlayed: p.hasPlayed,
          playedAt: p.playedAt,
          rank: p.rank
        }))
      };
    });

    res.json(formattedCompetitions);
  } catch (e) {
    next(e);
  }
};


export const getUserCompetitions = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const competitionPlayers = await prisma.competitionPlayer.findMany({
      where: { userId: uid },
      include: {
        Competition: {
          include: {
            game: {
              select: {
                name: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                imageUrl: true
              }
            },
            players: {
              include: {
                User: { select: { username: true } }
              },
              orderBy: { score: 'desc' }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const formattedCompetitions = competitionPlayers.map(cp => {
      const c = cp.Competition;
      const playedPlayers = c.players.filter(p => p.hasPlayed);
      const userRank = playedPlayers.findIndex(p => p.userId === uid) + 1;
      const playedCount = playedPlayers.length;

      return {
        id: c.id,
        code: c.code,
        title: c.title,
        privacy: c.privacy,
        status: c.status,
        maxPlayers: c.maxPlayers,
        currentPlayers: c.players.length,
        playedCount: playedCount,
        entryFee: c.entryFee,
        totalPrizePool: c.totalPrizePool,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        currentRank: c.status === 'ONGOING' || c.status === 'UPCOMING' ? userRank : null,
        finalRank: cp.rank,
        finalScore: cp.score,
        hasPlayed: cp.hasPlayed,
        gameLevel: c.game.level.toLowerCase(),
        earnings: 0,
        totalPlayers: c.players.length,
        Game: {
          name: c.game.name,
          gameType: c.game.gameType,
          level: c.game.level,
          playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
          imageUrl: c.game.imageUrl
        },
        players: c.players.map(p => ({
          id: p.id,
          username: p.User.username,
          score: p.score,
          hasPlayed: p.hasPlayed,
          playedAt: p.playedAt,
          rank: p.rank
        }))
      };
    });

    res.json(formattedCompetitions);
  } catch (e) {
    next(e);
  }
};

const createCompetitionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  gameId: z.string().cuid("Invalid game ID"),
  privacy: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
  maxPlayers: z.number().int().min(2, "Must allow at least 2 players").max(1000, "Cannot exceed 1000 players"),
  entryFee: z.number().int().min(0, "Entry fee cannot be negative"),
  startsAt: z.string().datetime("Invalid start date"),
  endsAt: z.string().datetime("Invalid end date")
});

export const create = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const body = createCompetitionSchema.parse(req.body);

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);
    const now = new Date();

    // Validate dates
    if (startsAt < now) {
      return res.status(400).json({
        error: "INVALID_START_TIME",
        message: "Start time must be in the future"
      });
    }

    if (endsAt <= startsAt) {
      return res.status(400).json({
        error: "INVALID_END_TIME",
        message: "End time must be after start time"
      });
    }

    const game = await prisma.game.findUnique({ where: { id: body.gameId } });
    if (!game) {
      return res.status(404).json({ error: "GAME_NOT_FOUND", message: "Game not found" });
    }

    // Validate against game constraints
    if (body.entryFee < game.minEntryFee) {
      return res.status(400).json({
        error: "ENTRY_FEE_BELOW_MIN",
        message: `Entry fee must be at least ${game.minEntryFee} cents`
      });
    }

    if (body.maxPlayers > game.maxPlayers) {
      return res.status(400).json({
        error: "EXCEEDS_MAX_PLAYERS",
        message: `This game supports maximum ${game.maxPlayers} players`
      });
    }

    if (body.maxPlayers < game.minPlayers) {
      return res.status(400).json({
        error: "BELOW_MIN_PLAYERS",
        message: `This game requires minimum ${game.minPlayers} players`
      });
    }

    // Check if creator has sufficient balance for entry fee
    if (body.entryFee > 0) {
      const wallet = await WalletOps.getOrCreateWallet(uid);
      if (wallet.balance < body.entryFee) {
        return res.status(400).json({
          error: "INSUFFICIENT_FUNDS",
          message: "Insufficient wallet balance to create this competition"
        });
      }
    }

    // Calculate prize pool contribution with dynamic fee
    const platformFee = calculatePlatformFee(body.entryFee, body.privacy);
    const addToPool = body.entryFee - platformFee;

    // Determine initial status based on start time
    const status = startsAt <= now ? "ONGOING" : "UPCOMING";

    // Create competition and auto-join creator in a transaction
    const competition = await prisma.$transaction(async (tx) => {
      const newCompetition = await tx.competition.create({
        data: {
          title: body.title,
          gameId: body.gameId,
          privacy: body.privacy,
          maxPlayers: body.maxPlayers,
          entryFee: body.entryFee,
          creatorId: uid,
          code: shortCode(),
          totalPrizePool: body.entryFee > 0 ? addToPool : 0,
          status,
          startsAt,
          endsAt
        },
        include: {
          game: {
            select: {
              name: true,
              gameType: true,
              level: true,
              minPlayers: true,
              maxPlayers: true,
              imageUrl: true
            }
          }
        }
      });

      // Deduct entry fee from creator's wallet if applicable
      if (body.entryFee > 0) {
        await WalletOps.debit(uid, body.entryFee, "ENTRY_FEE", {
          competitionId: newCompetition.id
        });
      }

      // Auto-join creator as first player
      await tx.competitionPlayer.create({
        data: {
          competitionId: newCompetition.id,
          userId: uid,
          paid: true
        }
      });

      return newCompetition;
    });

    const timeRemaining = Math.max(0, Math.floor((endsAt - now) / 1000));

    res.json({
      ...competition,
      timeRemaining
    });
  } catch (e) {
    next(e);
  }
};

export const leaveCompetition = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();

    const currentUser = await prisma.user.findUnique({
      where: { id: uid },
      select: { username: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
        players: {
          include: {
            User: { select: { username: true } }
          }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    // Check if user is in competition
    const player = competition.players.find(p => p.userId === uid);
    if (!player) {
      return res.status(404).json({
        error: "NOT_JOINED",
        message: "You are not in this competition"
      });
    }

    // Check if anyone has played
    const hasAnyonePlayed = competition.players.some(p => p.hasPlayed);
    if (hasAnyonePlayed) {
      return res.status(400).json({
        error: "GAME_STARTED",
        message: "Cannot leave after someone has started playing"
      });
    }

    // Cannot leave if you're the creator and there are other players
    if (competition.creatorId === uid && competition.players.length > 1) {
      return res.status(400).json({
        error: "CREATOR_CANNOT_LEAVE",
        message: "Creator cannot leave while other players are in the competition"
      });
    }

    await prisma.$transaction(async (tx) => {
      // Remove player
      await tx.competitionPlayer.delete({
        where: { id: player.id }
      });

      // Refund entry fee
      if (competition.entryFee > 0) {
        await WalletOps.credit(uid, competition.entryFee, "REFUND", {
          competitionId: competition.id,
          reason: "Left competition before game started"
        });

        // Reduce prize pool with dynamic fee
        const platformFee = calculatePlatformFee(competition.entryFee, competition.privacy);
        const removeFromPool = competition.entryFee - platformFee;

        await tx.competition.update({
          where: { id: competition.id },
          data: { totalPrizePool: { decrement: removeFromPool } }
        });
      }

      // If creator is leaving and alone, delete competition
      if (competition.creatorId === uid && competition.players.length === 1) {
        await tx.competition.delete({
          where: { id: competition.id }
        });
      }
    });

    const io = req.app.get('io');
    if (io) {
      // Notify all players in the competition
      io.to(`comp:${code}`).emit('competition:player_left', {
        competitionId: competition.id,
        competitionCode: code,
        competitionTitle: competition.title,
        player: currentUser.username,
        userId: uid,
        remainingPlayers: competition.players.length - 1,
        timestamp: new Date().toISOString()
      });

      // Notify creator specifically if leaver is not creator
      if (competition.creatorId !== uid) {
        io.emitToUser(competition.creatorId, 'player_left_competition', {
          competitionId: competition.id,
          competitionTitle: competition.title,
          player: currentUser.username,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({ ok: true, message: "Successfully left competition", competitionCode: code });
  } catch (e) {
    next(e);
  }
};

export const getTimeRemaining = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();

    const competition = await prisma.competition.findUnique({
      where: { code },
      select: { endsAt: true, startsAt: true, status: true }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((competition.endsAt - now) / 1000));
    const timeUntilStart = Math.max(0, Math.floor((competition.startsAt - now) / 1000));

    res.json({
      startsAt: competition.startsAt,
      endsAt: competition.endsAt,
      timeRemaining,
      timeUntilStart,
      status: competition.status,
      isExpired: timeRemaining === 0
    });
  } catch (e) {
    next(e);
  }
};

export const joinByCode = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();

    const currentUser = await prisma.user.findUnique({
      where: { id: uid },
      select: { username: true }
    });

    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
        players: {
          include: {
            User: { select: { id: true, username: true } }
          }
        },
        game: {
          select: {
            gameType: true,
            minPlayers: true,
            maxPlayers: true
          }
        },
        creator: {
          select: { id: true, username: true }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    // Check if competition is completed or canceled
    if (competition.status === "COMPLETED" || competition.status === "CANCELED") {
      return res.status(400).json({ error: "COMPETITION_ENDED", message: "Competition has ended" });
    }

    // Check if user already exists in competition
    const existingPlayer = competition.players.find(p => p.userId === uid);
    if (existingPlayer) {
      return res.json({
        ok: true,
        alreadyJoined: true,
        message: "You are already in this competition"
      });
    }

    // Check if competition is full
    if (competition.players.length >= competition.maxPlayers) {
      return res.status(400).json({
        error: "FULL",
        message: `Competition is full (${competition.maxPlayers}/${competition.maxPlayers} players)`
      });
    }

    // Check if user has sufficient balance
    const wallet = await WalletOps.getOrCreateWallet(uid);
    if (wallet.balance < competition.entryFee) {
      return res.status(400).json({ error: "INSUFFICIENT_FUNDS", message: "Insufficient wallet balance" });
    }

    await WalletOps.debit(uid, competition.entryFee, "ENTRY_FEE", { competitionId: competition.id });

    // Calculate prize pool with dynamic fee
    const platformFee = calculatePlatformFee(competition.entryFee, competition.privacy);
    const addToPool = competition.entryFee - platformFee;

    await prisma.$transaction(async (tx) => {
      await tx.competition.update({
        where: { id: competition.id },
        data: { totalPrizePool: { increment: addToPool } }
      });

      await tx.competitionPlayer.create({
        data: {
          competitionId: competition.id,
          userId: uid,
          paid: true
        }
      });

      // Add to game history - single entry per pair
      const historyPromises = competition.players.map(player =>
        tx.gameHistory.create({
          data: {
            userId: uid,
            playedWithId: player.userId,
            competitionId: competition.id,
            gameType: competition.game?.gameType || 'ARCADE'
          }
        })
      );

      await Promise.all(historyPromises);
    });

    // Emit socket event to competition creator
    const io = req.app.get('io');
    if (io && competition.creatorId !== uid) {
      io.emitToUser(competition.creatorId, 'competition_joined', {
        competitionId: competition.id,
        competitionTitle: competition.title,
        competitionCode: competition.code,
        player: currentUser.username,
        currentPlayers: competition.players.length + 1,
        maxPlayers: competition.maxPlayers,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      ok: true,
      poolIncrement: addToPool,
      currentPlayers: competition.players.length + 1,
      maxPlayers: competition.maxPlayers
    });
  } catch (e) {
    next(e);
  }
};

export const inviteByUsername = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { competitionId, username } = z.object({
      competitionId: z.string().cuid(),
      username: z.string().min(1)
    }).parse(req.body);

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        players: {
          include: {
            User: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    // Check if user is either creator OR participant
    const isCreator = competition.creatorId === uid;
    const isParticipant = competition.players.some(p => p.userId === uid);

    if (!isCreator && !isParticipant) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "You must be part of this competition to send invites"
      });
    }

    // Check if competition is still open
    if (competition.status === "COMPLETED" || competition.status === "CANCELED") {
      return res.status(400).json({
        error: "COMPETITION_ENDED",
        message: "Cannot invite to a completed competition"
      });
    }

    if (competition.players.length >= competition.maxPlayers) {
      return res.status(400).json({
        error: "FULL",
        message: "Competition is full"
      });
    }

    const invitee = await prisma.user.findUnique({ where: { username } });
    if (!invitee) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    if (invitee.id === uid) {
      return res.status(400).json({
        error: "SELF_INVITE",
        message: "You cannot invite yourself"
      });
    }

    // Check if user is already in the competition
    const existingPlayer = competition.players.find(p => p.userId === invitee.id);
    if (existingPlayer) {
      return res.status(400).json({
        error: "ALREADY_JOINED",
        message: `${username} is already in this competition`
      });
    }

    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: {
        competitionId,
        inviteeId: invitee.id,
        accepted: false
      }
    });

    if (existingInvite) {
      return res.status(400).json({
        error: "INVITE_EXISTS",
        message: "This user has already been invited"
      });
    }

    const invite = await prisma.invite.create({
      data: {
        competitionId,
        inviterId: uid,
        inviteeId: invitee.id,
        inviteeUsername: invitee.username,
        code: shortCode()
      },
      include: {
        Competition: {
          include: {
            game: { select: { name: true, imageUrl: true } }
          }
        },
        inviter: { select: { username: true } }
      }
    });

    // Emit socket event to invitee
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(invitee.id, 'new_invite', {
        invite: {
          id: invite.id,
          competition: {
            id: competition.id,
            title: competition.title,
            code: competition.code,
            entryFee: competition.entryFee,
            game: invite.Competition.game
          },
          inviter: invite.inviter,
          createdAt: invite.createdAt
        }
      });
    }

    res.json({ ok: true, invite });
  } catch (e) {
    next(e);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { inviteId } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        Competition: {
          include: {
            players: true,
            game: { select: { gameType: true } }
          }
        },
        inviter: { select: { id: true, username: true } },
        invitee: { select: { id: true, username: true } }
      }
    });

    if (!invite) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Invite not found" });
    }

    if (invite.inviteeId !== uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "This invite is not for you" });
    }

    if (invite.accepted) {
      return res.status(400).json({ error: "ALREADY_ACCEPTED", message: "Invite already accepted" });
    }

    const competition = invite.Competition;

    if (competition.status === "COMPLETED" || competition.status === "CANCELED") {
      return res.status(400).json({ error: "COMPETITION_ENDED", message: "Competition has ended" });
    }

    if (competition.players.length >= competition.maxPlayers) {
      return res.status(400).json({ error: "FULL", message: "Competition is full" });
    }

    // Check if user has sufficient balance
    const wallet = await WalletOps.getOrCreateWallet(uid);
    if (wallet.balance < competition.entryFee) {
      return res.status(400).json({ error: "INSUFFICIENT_FUNDS", message: "Insufficient wallet balance" });
    }

    await WalletOps.debit(uid, competition.entryFee, "ENTRY_FEE", { competitionId: competition.id });

    const platformFee = calculatePlatformFee(competition.entryFee, competition.privacy);
    const addToPool = competition.entryFee - platformFee;

    await prisma.$transaction(async (tx) => {
      await tx.invite.update({
        where: { id: inviteId },
        data: { accepted: true }
      });

      await tx.competition.update({
        where: { id: competition.id },
        data: { totalPrizePool: { increment: addToPool } }
      });

      await tx.competitionPlayer.create({
        data: {
          competitionId: competition.id,
          userId: uid,
          paid: true
        }
      });

      // Add to game history
      const historyPromises = competition.players.map(player =>
        tx.gameHistory.create({
          data: {
            userId: uid,
            playedWithId: player.userId,
            competitionId: competition.id,
            gameType: competition.game?.gameType || 'ARCADE'
          }
        })
      );

      await Promise.all(historyPromises);
    });

    // Emit socket event to inviter
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(invite.inviter.id, 'invite_accepted', {
        inviteId,
        acceptedBy: {
          id: invite.invitee.id,
          username: invite.invitee.username
        },
        competitionTitle: competition.title,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ ok: true, poolIncrement: addToPool });
  } catch (e) {
    next(e);
  }
};

export const getCompetition = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();

    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
        game: {
          select: {
            name: true,
            gameType: true,
            level: true,
            minPlayers: true,
            maxPlayers: true,
            imageUrl: true,
            description: true
          }
        },
        creator: { select: { username: true } },
        players: {
          include: {
            User: { select: { username: true } }
          },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    const playedCount = competition.players.filter(p => p.hasPlayed).length;
    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((competition.endsAt - now) / 1000));

    const formattedCompetition = {
      ...competition,
      playedCount,
      timeRemaining,
      gameLevel: competition.game.level.toLowerCase(),
      Game: {
        name: competition.game.name,
        gameType: competition.game.gameType,
        level: competition.game.level,
        playerRange: `${competition.game.minPlayers}-${competition.game.maxPlayers}`,
        imageUrl: competition.game.imageUrl,
        description: competition.game.description
      },
      players: competition.players.map((p, index) => ({
        id: p.id,
        username: p.User.username,
        score: p.score,
        hasPlayed: p.hasPlayed,
        playedAt: p.playedAt,
        rank: p.rank || (p.hasPlayed ? index + 1 : null),
        joinedAt: p.joinedAt
      }))
    };

    delete formattedCompetition.game;

    res.json(formattedCompetition);
  } catch (e) {
    next(e);
  }
};

export const submitScore = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { score } = z.object({
      score: z.number().int().min(0, "Score cannot be negative")
    }).parse(req.body);
    const code = req.params.code.toUpperCase();

    const currentUser = await prisma.user.findUnique({
      where: { id: uid },
      select: { username: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
        players: true,
        game: { select: { minPlayers: true } }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    if (competition.status === "COMPLETED" || competition.status === "CANCELED") {
      return res.status(400).json({ error: "COMPETITION_ENDED", message: "Competition has ended" });
    }

    const player = competition.players.find(p => p.userId === uid);
    if (!player) {
      return res.status(404).json({ error: "NOT_JOINED", message: "You are not a participant in this competition" });
    }

    const updated = await prisma.competitionPlayer.update({
      where: { id: player.id },
      data: {
        score,
        hasPlayed: true,
        playedAt: new Date()
      }
    });

    // Check if all players have played and auto-complete if so
    const allPlayers = await prisma.competitionPlayer.findMany({
      where: { competitionId: competition.id }
    });

    const allPlayedCount = allPlayers.filter(p => p.hasPlayed).length;

    if (allPlayedCount === allPlayers.length && allPlayers.length >= competition.game.minPlayers) {
      // Auto-complete the competition
      await autoCompleteCompetition(competition.id);
    }

    // Emit socket event for score update
    const io = req.app.get('io');
    if (io) {
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

      // Broadcast to competition subscribers
      io.to(`comp:${code.toUpperCase()}`).emit("leaderboard:update", {
        competition: code.toUpperCase(),
        leaderboard: formattedLeaderboard,
        timestamp: new Date().toISOString()
      });

      // Notify competition creator
      if (competition.creatorId !== uid) {
        io.emitToUser(competition.creatorId, "score_submitted", {
          competitionId: competition.id,
          competitionTitle: competition.title,
          competitionCode: competition.code,
          player: currentUser.username,
          score: score,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      ok: true,
      playedCount: allPlayedCount,
      totalPlayers: allPlayers.length,
      allCompleted: allPlayedCount === allPlayers.length
    });
  } catch (e) {
    next(e);
  }
};

async function autoCompleteCompetition(competitionId) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      players: {
        include: { User: true },
        orderBy: { score: 'desc' }
      }
    }
  });

  if (!competition || competition.status === 'COMPLETED') return;

  const playedPlayers = competition.players.filter(p => p.hasPlayed);
  const unplayedPlayers = competition.players.filter(p => !p.hasPlayed);

  if (playedPlayers.length === 0) {
    console.log("No players have completed the competition yet");
    return;
  }

  const prizePool = competition.totalPrizePool;
  const { distributions } = calculatePrizeBreakdown(
    prizePool,
    playedPlayers.length,
    playedPlayers
  );

  await prisma.$transaction(async (tx) => {
    // Update competition status
    await tx.competition.update({
      where: { id: competitionId },
      data: { status: "COMPLETED" }
    });

    // Update rankings for players who played
    for (let i = 0; i < playedPlayers.length; i++) {
      await tx.competitionPlayer.update({
        where: { id: playedPlayers[i].id },
        data: { rank: i + 1 }
      });
    }

    // Set unplayed players to score 0 and last ranks
    for (let i = 0; i < unplayedPlayers.length; i++) {
      await tx.competitionPlayer.update({
        where: { id: unplayedPlayers[i].id },
        data: {
          score: 0,
          hasPlayed: false,
          rank: playedPlayers.length + i + 1
        }
      });
    }

    // Distribute prizes to winners
    for (const distribution of distributions) {
      if (distribution.prize > 0) {
        const wallet = await WalletOps.getOrCreateWallet(distribution.userId);

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "PRIZE",
            amount: distribution.prize,
            meta: {
              competitionId: competitionId,
              rank: distribution.rank,
              competitionTitle: competition.title
            }
          }
        });

        await tx.wallet.update({
          where: { userId: distribution.userId },
          data: { balance: { increment: distribution.prize } }
        });
      }
    }
  });
}

function calculatePrizeBreakdown(totalPrizePool, playerCount, topScores) {
  if (totalPrizePool <= 0 || playerCount < 1) {
    return { distributions: [] };
  }

  // Check for ties at first place
  const firstPlaceScore = topScores[0]?.score;
  const firstPlaceTies = topScores.filter(p => p.score === firstPlaceScore);

  if (firstPlaceTies.length > 1) {
    // Split entire prize pool among tied winners
    const prizePerWinner = Math.floor(totalPrizePool / firstPlaceTies.length);
    return {
      distributions: firstPlaceTies.map((player, index) => ({
        userId: player.userId,
        rank: 1,
        prize: prizePerWinner
      }))
    };
  }

  // Regular distribution (no ties)
  if (playerCount === 1) {
    return {
      distributions: [{
        userId: topScores[0].userId,
        rank: 1,
        prize: totalPrizePool
      }]
    };
  }

  if (playerCount === 2) {
    const first = Math.floor(totalPrizePool * 0.75);
    const second = totalPrizePool - first;
    return {
      distributions: [
        { userId: topScores[0].userId, rank: 1, prize: first },
        { userId: topScores[1].userId, rank: 2, prize: second }
      ]
    };
  }

  // For 3+ players: 75% first, 15% second, 10% third
  const first = Math.floor(totalPrizePool * 0.75);
  const second = Math.floor(totalPrizePool * 0.15);
  const third = totalPrizePool - first - second;

  return {
    distributions: [
      { userId: topScores[0].userId, rank: 1, prize: first },
      { userId: topScores[1]?.userId, rank: 2, prize: second },
      { userId: topScores[2]?.userId, rank: 3, prize: third }
    ].filter(d => d.userId)
  };
}

export const cleanupExpiredCompetitions = async (io) => {
  try {
    const now = new Date();

    // Find competitions that have passed their end time
    const expiredCompetitions = await prisma.competition.findMany({
      where: {
        endsAt: { lte: now },
        status: { in: ["ONGOING", "UPCOMING"] }
      },
      include: {
        players: {
          include: { User: true }
        }
      }
    });

    for (const competition of expiredCompetitions) {
      const hasAnyonePlayed = competition.players.some(p => p.hasPlayed);
      const isCreatorOnly = competition.players.length === 1;

      // SCENARIO A: Only creator joined, no one played
      if (isCreatorOnly && !hasAnyonePlayed) {
        // Notify the creator BEFORE deletion
        if (io) {
          io.emitToUser(competition.creatorId, 'competition_expired', {
            competitionId: competition.id,
            competitionCode: competition.code,
            competitionTitle: competition.title,
            reason: 'NO_PARTICIPANTS',
            message: 'Competition expired with no other players',
            refundAmount: competition.entryFee,
            timestamp: new Date().toISOString()
          });

          // Broadcast to competition room
          io.to(`comp:${competition.code.toUpperCase()}`).emit('competition_deleted', {
            competitionCode: competition.code,
            reason: 'EXPIRED_NO_PARTICIPANTS',
            timestamp: new Date().toISOString()
          });
        }

        await prisma.$transaction(async (tx) => {
          const creator = competition.players[0];

          // Full refund to creator (100%)
          if (competition.entryFee > 0) {
            await WalletOps.credit(creator.userId, competition.entryFee, "REFUND", {
              competitionId: competition.id,
              reason: "Competition expired with no other players"
            });
          }

          // DELETE the competition
          await tx.competition.delete({
            where: { id: competition.id }
          });
        });

        console.log(`Deleted expired competition ${competition.code} - creator only`);
        continue;
      }

      // SCENARIO B: Multiple players joined but NO ONE played
      if (!hasAnyonePlayed && !isCreatorOnly) {
        // Notify all players BEFORE cancellation
        if (io) {
          const platformFee = calculatePlatformFee(competition.entryFee, competition.privacy);
          const refundAmount = competition.entryFee - platformFee;

          // Notify each player individually
          for (const player of competition.players) {
            io.emitToUser(player.userId, 'competition_expired', {
              competitionId: competition.id,
              competitionCode: competition.code,
              competitionTitle: competition.title,
              reason: 'NO_ACTIVITY',
              message: 'Competition expired with no participants',
              refundAmount: competition.entryFee > 0 ? refundAmount : 0,
              originalAmount: competition.entryFee,
              commissionDeducted: platformFee,
              timestamp: new Date().toISOString()
            });
          }

          // Broadcast to competition room
          io.to(`comp:${competition.code.toUpperCase()}`).emit('competition_canceled', {
            competitionCode: competition.code,
            reason: 'EXPIRED_NO_ACTIVITY',
            message: 'Competition canceled - no participants played',
            timestamp: new Date().toISOString()
          });
        }

        await prisma.$transaction(async (tx) => {
          // Refund each player MINUS commission based on privacy
          for (const player of competition.players) {
            if (competition.entryFee > 0) {
              const platformFee = calculatePlatformFee(competition.entryFee, competition.privacy);
              const refundAmount = competition.entryFee - platformFee;

              await WalletOps.credit(player.userId, refundAmount, "REFUND", {
                competitionId: competition.id,
                reason: "Competition expired with no participants",
                originalAmount: competition.entryFee,
                commissionDeducted: platformFee
              });
            }
          }

          // CANCEL the competition (keep record)
          await tx.competition.update({
            where: { id: competition.id },
            data: { status: "CANCELED" }
          });
        });

        console.log(`Canceled expired competition ${competition.code} - no participants`);
        continue;
      }

      // SCENARIO C: Some players played, complete competition normally
      if (hasAnyonePlayed) {
        // Notify all players about completion
        if (io) {
          for (const player of competition.players) {
            io.emitToUser(player.userId, 'competition_completed', {
              competitionId: competition.id,
              competitionCode: competition.code,
              competitionTitle: competition.title,
              message: 'Competition has been completed',
              timestamp: new Date().toISOString()
            });
          }

          // Broadcast to competition room
          io.to(`comp:${competition.code.toUpperCase()}`).emit('competition_completed', {
            competitionCode: competition.code,
            message: 'Competition time ended - results finalized',
            timestamp: new Date().toISOString()
          });
        }

        await autoCompleteCompetition(competition.id);
        console.log(`Completed expired competition ${competition.code} - had participants`);
      }
    }

    console.log(`Cleaned up ${expiredCompetitions.length} expired competitions`);
  } catch (error) {
    console.error("Error cleaning up expired competitions:", error);
  }
};

export const updateCompetitionStatuses = async (io) => {
  try {
    const now = new Date();

    // Find competitions that should transition to ONGOING
    const competitionsToStart = await prisma.competition.findMany({
      where: {
        status: "UPCOMING",
        startsAt: { lte: now }
      },
      include: {
        players: {
          include: {
            User: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (competitionsToStart.length > 0) {
      // Update all competitions to ONGOING
      await prisma.competition.updateMany({
        where: {
          status: "UPCOMING",
          startsAt: { lte: now }
        },
        data: {
          status: "ONGOING"
        }
      });

      console.log(`✅ Started ${competitionsToStart.length} competition(s)`);

      // Emit socket events to notify participants
      if (io) {
        for (const competition of competitionsToStart) {
          // Notify all players in the competition
          for (const player of competition.players) {
            io.emitToUser(player.userId, 'competition_started', {
              competitionId: competition.id,
              competitionCode: competition.code,
              competitionTitle: competition.title,
              startsAt: competition.startsAt,
              endsAt: competition.endsAt,
              timestamp: new Date().toISOString()
            });
          }

          // Broadcast to competition room
          io.to(`comp:${competition.code.toUpperCase()}`).emit('competition_status_changed', {
            competitionCode: competition.code,
            status: 'ONGOING',
            message: 'Competition has started!',
            timestamp: new Date().toISOString()
          });

          console.log(`📢 Notified ${competition.players.length} players for competition ${competition.code}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error updating competition statuses:", error);
    throw error;
  }
};

export const complete = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();

    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
        players: {
          include: { User: true },
          where: { hasPlayed: true },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    if (competition.creatorId !== uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Only the creator can complete the competition" });
    }

    if (competition.status === "COMPLETED") {
      return res.status(400).json({ error: "ALREADY_COMPLETED", message: "Competition is already completed" });
    }

    await autoCompleteCompetition(competition.id);

    const results = {
      winners: competition.players.slice(0, 3).map((player, index) => ({
        rank: index + 1,
        username: player.User.username,
        score: player.score,
        prize: calculatePrizeBreakdown(competition.totalPrizePool, competition.players.length)[
          index === 0 ? 'first' : index === 1 ? 'second' : 'third'
        ] || 0
      })),
      totalPrizePool: competition.totalPrizePool
    };

    res.json({ ok: true, results });
  } catch (e) {
    next(e);
  }
};

// Friends system endpoints
export const getFriends = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: uid, status: 'ACCEPTED' },
          { receiverId: uid, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } }
      }
    });

    const friends = friendRequests.map(fr => {
      const friend = fr.senderId === uid ? fr.receiver : fr.sender;
      return {
        id: friend.id,
        username: friend.username,
        friendsSince: fr.updatedAt
      };
    });

    res.json(friends);
  } catch (e) {
    next(e);
  }
};

export const getFriendRequests = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const [received, sent] = await Promise.all([
      prisma.friendRequest.findMany({
        where: { receiverId: uid, status: 'PENDING' },
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.friendRequest.findMany({
        where: { senderId: uid, status: 'PENDING' },
        include: { receiver: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      received: received.map(fr => ({
        id: fr.id,
        from: fr.sender,
        createdAt: fr.createdAt
      })),
      sent: sent.map(fr => ({
        id: fr.id,
        to: fr.receiver,
        createdAt: fr.createdAt
      }))
    });
  } catch (e) {
    next(e);
  }
};

export const sendFriendRequest = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { username } = z.object({
      username: z.string().min(1)
    }).parse(req.body);

    const receiver = await prisma.user.findUnique({ where: { username } });
    if (!receiver) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    if (receiver.id === uid) {
      return res.status(400).json({ error: "SELF_REQUEST", message: "Cannot send friend request to yourself" });
    }

    // Check if already friends or request exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: uid, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: uid }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return res.status(400).json({ error: "ALREADY_FRIENDS", message: "Already friends" });
      }
      return res.status(400).json({ error: "REQUEST_EXISTS", message: "Friend request already exists" });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: uid,
        receiverId: receiver.id
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { username: true } }
      }
    });

    // Emit socket event to receiver
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(receiver.id, 'new_friend_request', {
        request: {
          id: friendRequest.id,
          from: friendRequest.sender,
          createdAt: friendRequest.createdAt
        }
      });
    }

    res.json({ ok: true, friendRequest });
  } catch (e) {
    next(e);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { requestId } = req.params;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { username: true } }
      }
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Friend request not found" });
    }

    if (friendRequest.receiverId !== uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Not your friend request" });
    }

    if (friendRequest.status !== 'PENDING') {
      return res.status(400).json({ error: "INVALID_STATUS", message: "Request already processed" });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    // Emit socket event to sender
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(friendRequest.senderId, 'friend_request_accepted', {
        acceptedBy: friendRequest.receiver
      });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const declineFriendRequest = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { requestId } = req.params;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } }
      }
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Friend request not found" });
    }

    if (friendRequest.receiverId !== uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Not your friend request" });
    }

    if (friendRequest.status !== 'PENDING') {
      return res.status(400).json({ error: "INVALID_STATUS", message: "Request already processed" });
    }

    // Delete the friend request instead of updating status
    await prisma.friendRequest.delete({
      where: { id: requestId }
    });

    const io = req.app.get('io');
    if (io) {
      io.emitToUser(friendRequest.senderId, 'friend_request_declined', {
        requestId: friendRequest.id,
        declinedBy: {
          id: friendRequest.receiver.id,
          username: friendRequest.receiver.username
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const getGameHistory = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const history = await prisma.gameHistory.findMany({
      where: { userId: uid },
      include: {
        user: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Group by playedWithId to get unique players and their play count
    const playerStats = history.reduce((acc, entry) => {
      if (!acc[entry.playedWithId]) {
        acc[entry.playedWithId] = {
          playedWithId: entry.playedWithId,
          gamesPlayed: 0,
          lastPlayed: entry.createdAt,
          gameTypes: new Set()
        };
      }

      acc[entry.playedWithId].gamesPlayed++;
      acc[entry.playedWithId].gameTypes.add(entry.gameType);

      if (entry.createdAt > acc[entry.playedWithId].lastPlayed) {
        acc[entry.playedWithId].lastPlayed = entry.createdAt;
      }

      return acc;
    }, {});

    // Get usernames for the players
    const playerIds = Object.keys(playerStats);
    const players = await prisma.user.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, username: true }
    });

    const formattedHistory = players.map(player => ({
      playerId: player.id,
      username: player.username,
      gamesPlayed: playerStats[player.id].gamesPlayed,
      lastPlayed: playerStats[player.id].lastPlayed,
      gameTypes: Array.from(playerStats[player.id].gameTypes)
    })).sort((a, b) => b.gamesPlayed - a.gamesPlayed);

    res.json(formattedHistory);
  } catch (e) {
    next(e);
  }
};

export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get top players by total earnings from completed competitions
    const leaderboard = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(t.amount), 0) as "totalEarnings",
        COUNT(DISTINCT cp."competitionId") as "competitionsWon",
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) as rank
      FROM "User" u
      LEFT JOIN "Wallet" w ON w."userId" = u.id
      LEFT JOIN "Transaction" t ON t."walletId" = w.id AND t.type = 'PRIZE'
      LEFT JOIN "CompetitionPlayer" cp ON cp."userId" = u.id AND cp.rank = 1
      GROUP BY u.id, u.username
      ORDER BY "totalEarnings" DESC
      LIMIT ${parseInt(limit)}
    `;

    const formattedLeaderboard = leaderboard.map(player => ({
      rank: Number(player.rank),
      username: player.username,
      totalEarnings: Number(player.totalEarnings),
      competitionsWon: Number(player.competitionsWon),
      isUser: false
    }));

    res.json(formattedLeaderboard);
  } catch (e) {
    next(e);
  }
};

export const getPendingInvites = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const invites = await prisma.invite.findMany({
      where: {
        inviteeId: uid,
        accepted: false
      },
      include: {
        Competition: {
          include: {
            game: { select: { name: true, imageUrl: true } }
          }
        },
        inviter: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invites);
  } catch (e) {
    next(e);
  }
};

export const getSentInvites = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const invites = await prisma.invite.findMany({
      where: {
        inviterId: uid
      },
      include: {
        Competition: {
          include: {
            game: { select: { name: true, imageUrl: true } }
          }
        },
        inviter: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invites);
  } catch (e) {
    next(e);
  }
};

// Decline invite
export const declineInvite = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { inviteId } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        inviter: { select: { id: true, username: true } },
        invitee: { select: { id: true, username: true } },
        Competition: { select: { title: true } }
      }
    });

    if (!invite || invite.inviteeId !== uid) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Invite not found" });
    }

    await prisma.invite.delete({ where: { id: inviteId } });

    // Emit socket event to inviter
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(invite.inviter.id, 'invite_declined', {
        inviteId,
        decliner: invite.invitee.username,
        competitionTitle: invite.Competition.title,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};


