import { prisma } from "../prisma.js";
import { z } from "zod";
import { shortCode } from "../utils/id.js";
import { WalletOps } from "./wallet.controller.js";

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
            minPlayTime: true,
            maxPlayTime: true,
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
      // Calculate current user's rank if they're in the competition
      const userPlayer = c.players.find(p => p.userId === uid);
      const currentRank = userPlayer ? c.players.findIndex(p => p.userId === uid) + 1 : null;
      
      return {
        id: c.id,
        code: c.code,
        title: c.title,
        // Remove description from listing
        privacy: c.privacy,
        status: c.status,
        minutesToPlay: c.minutesToPlay,
        maxPlayers: c.maxPlayers,
        currentPlayers: c.players.length,
        entryFee: c.entryFee,
        totalPrizePool: c.totalPrizePool,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        // Add fields needed by PlayPage
        currentRank: currentRank,
        gameLevel: c.game.level.toLowerCase(),
        finalRank: userPlayer?.rank || null,
        finalScore: userPlayer?.score || null,
        earnings: 0, // This would need to be calculated from transaction history
        totalPlayers: c.players.length,
        Game: { 
          name: c.game.name,
          gameType: c.game.gameType,
          level: c.game.level,
          playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
          playTimeRange: `${c.game.minPlayTime}-${c.game.maxPlayTime} min`,
          imageUrl: c.game.imageUrl
        }
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
            minPlayTime: true,
            maxPlayTime: true,
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
    
    const formattedCompetitions = competitions.map(c => ({
      id: c.id,
      code: c.code,
      title: c.title,
      // Remove description from listing
      privacy: c.privacy,
      status: c.status,
      minutesToPlay: c.minutesToPlay,
      maxPlayers: c.maxPlayers,
      currentPlayers: c.players.length,
      entryFee: c.entryFee,
      totalPrizePool: c.totalPrizePool,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      creator: c.creator.username,
      // Add fields needed by PlayPage
      gameLevel: c.game.level.toLowerCase(),
      totalPlayers: c.players.length,
      Game: { 
        name: c.game.name,
        gameType: c.game.gameType,
        level: c.game.level,
        playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
        playTimeRange: `${c.game.minPlayTime}-${c.game.maxPlayTime} min`,
        imageUrl: c.game.imageUrl
      }
    }));
    
    res.json(formattedCompetitions);
  } catch (e) {
    next(e);
  }
};

// Add new endpoint for user's participated competitions
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
                minPlayTime: true,
                maxPlayTime: true,
                imageUrl: true
              }
            },
            players: {
              orderBy: { score: 'desc' }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const formattedCompetitions = competitionPlayers.map(cp => {
      const c = cp.Competition;
      const userRank = c.players.findIndex(p => p.userId === uid) + 1;
      
      return {
        id: c.id,
        code: c.code,
        title: c.title,
        // Remove description from listing
        privacy: c.privacy,
        status: c.status,
        minutesToPlay: c.minutesToPlay,
        maxPlayers: c.maxPlayers,
        currentPlayers: c.players.length,
        entryFee: c.entryFee,
        totalPrizePool: c.totalPrizePool,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        // Add fields needed by PlayPage
        currentRank: c.status === 'ONGOING' || c.status === 'UPCOMING' ? userRank : null,
        finalRank: cp.rank,
        finalScore: cp.score,
        gameLevel: c.game.level.toLowerCase(),
        earnings: 0, // Calculate from transaction history
        totalPlayers: c.players.length,
        Game: { 
          name: c.game.name,
          gameType: c.game.gameType,
          level: c.game.level,
          playerRange: `${c.game.minPlayers}-${c.game.maxPlayers}`,
          playTimeRange: `${c.game.minPlayTime}-${c.game.maxPlayTime} min`,
          imageUrl: c.game.imageUrl
        }
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
  privacy: z.enum(["PUBLIC","PRIVATE"]).default("PRIVATE"),
  minutesToPlay: z.number().int().min(1, "Duration must be at least 1 minute"),
  maxPlayers: z.number().int().min(2, "Must allow at least 2 players").max(1000, "Cannot exceed 1000 players"),
  entryFee: z.number().int().min(0, "Entry fee cannot be negative"),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
}).refine(data => data.endsAt > data.startsAt, {
  message: "End time must be after start time",
  path: ["endsAt"]
});

export const create = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const body = createCompetitionSchema.parse(req.body);

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

    if (body.minutesToPlay < game.minPlayTime || body.minutesToPlay > game.maxPlayTime) {
      return res.status(400).json({ 
        error: "INVALID_PLAY_TIME", 
        message: `Play time must be between ${game.minPlayTime}-${game.maxPlayTime} minutes for this game` 
      });
    }

    const competition = await prisma.competition.create({ 
      data: { 
        ...body, 
        creatorId: uid, 
        code: shortCode(), 
        totalPrizePool: 0 
      },
      include: {
        game: {
          select: {
            name: true,
            gameType: true,
            level: true,
            minPlayers: true,
            maxPlayers: true,
            minPlayTime: true,
            maxPlayTime: true,
            imageUrl: true
          }
        }
      }
    });
    
    res.json(competition);
  } catch (e) { 
    next(e); 
  }
};

export const joinByCode = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();
    
    const competition = await prisma.competition.findUnique({ 
      where: { code }, 
      include: { 
        players: true,
        game: {
          select: {
            minPlayers: true,
            maxPlayers: true
          }
        }
      } 
    });
    
    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    // Privacy check - if private, only allow if user has access
    if (competition.privacy === "PRIVATE") {
      // For private competitions, you might want to check if user has an invite
      // or if they're the creator, etc. This is a business logic decision
      const hasAccess = competition.creatorId === uid; // Creator always has access
      
      if (!hasAccess) {
        // You could also check for invites here
        const invite = await prisma.invite.findFirst({
          where: {
            competitionId: competition.id,
            inviteeId: uid,
            accepted: false
          }
        });
        
        if (!invite) {
          return res.status(403).json({ 
            error: "PRIVATE_COMPETITION", 
            message: "This is a private competition. You need an invitation to join." 
          });
        }
      }
    }
    
    if (competition.status !== "UPCOMING") {
      return res.status(400).json({ error: "COMPETITION_NOT_JOINABLE", message: "Competition is not accepting new players" });
    }
    
    const existingPlayer = competition.players.find(p => p.userId === uid);
    if (existingPlayer) {
      return res.json({ ok: true, alreadyJoined: true });
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
    
    const platformFee = Math.floor(competition.entryFee * 0.1);
    const addToPool = competition.entryFee - platformFee;

    await prisma.$transaction([
      prisma.competition.update({ 
        where: { id: competition.id }, 
        data: { totalPrizePool: { increment: addToPool } } 
      }),
      prisma.competitionPlayer.create({ 
        data: { 
          competitionId: competition.id, 
          userId: uid, 
          paid: true 
        } 
      }),
    ]);

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
            minPlayTime: true,
            maxPlayTime: true,
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

    const formattedCompetition = {
      ...competition,
      gameLevel: competition.game.level.toLowerCase(),
      Game: {
        name: competition.game.name,
        gameType: competition.game.gameType,
        level: competition.game.level,
        playerRange: `${competition.game.minPlayers}-${competition.game.maxPlayers}`,
        playTimeRange: `${competition.game.minPlayTime}-${competition.game.maxPlayTime} min`,
        imageUrl: competition.game.imageUrl,
        description: competition.game.description
      },
      players: competition.players.map((p, index) => ({
        id: p.id,
        username: p.User.username,
        score: p.score,
        isReady: p.isReady,
        rank: p.rank || (index + 1),
        joinedAt: p.joinedAt
      }))
    };

    // Remove the nested game object since we've formatted it
    delete formattedCompetition.game;

    res.json(formattedCompetition);
  } catch (e) {
    next(e);
  }
};

export const readyUp = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();
    
    const competition = await prisma.competition.findUnique({ 
      where: { code },
      include: {
        game: {
          select: { minPlayers: true }
        }
      }
    });
    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    if (competition.status !== "UPCOMING") {
      return res.status(400).json({ error: "COMPETITION_STARTED", message: "Competition has already started" });
    }

    const updated = await prisma.competitionPlayer.updateMany({ 
      where: { 
        competitionId: competition.id, 
        userId: uid 
      }, 
      data: { isReady: true } 
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "NOT_JOINED", message: "You are not a participant in this competition" });
    }

    const totalPlayers = await prisma.competitionPlayer.count({ 
      where: { competitionId: competition.id } 
    });
    
    const readyPlayers = await prisma.competitionPlayer.count({ 
      where: { competitionId: competition.id, isReady: true } 
    });

    // Start competition if all players are ready and meets minimum requirements
    const minPlayersRequired = competition.game.minPlayers;
    if (totalPlayers >= minPlayersRequired && readyPlayers === totalPlayers) {
      await prisma.competition.update({ 
        where: { id: competition.id }, 
        data: { status: "ONGOING" } 
      });
    }

    res.json({ 
      ok: true, 
      readyCount: readyPlayers, 
      total: totalPlayers,
      minRequired: minPlayersRequired
    });
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
    
    const competition = await prisma.competition.findUnique({ where: { code } });
    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }

    if (competition.status !== "ONGOING") {
      return res.status(400).json({ error: "COMPETITION_NOT_ACTIVE", message: "Competition is not currently active" });
    }

    const updated = await prisma.competitionPlayer.updateMany({ 
      where: { 
        competitionId: competition.id, 
        userId: uid 
      }, 
      data: { score } 
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "NOT_JOINED", message: "You are not a participant in this competition" });
    }

    res.json({ ok: true });
  } catch (e) { 
    next(e); 
  }
};

function calculatePrizeBreakdown(totalPrizePool, playerCount) {
  if (totalPrizePool <= 0 || playerCount < 2) {
    return { first: 0, second: 0, third: 0 };
  }

  if (playerCount === 2) {
    return {
      first: Math.floor(totalPrizePool * 0.7),
      second: totalPrizePool - Math.floor(totalPrizePool * 0.7),
      third: 0
    };
  }

  const first = Math.floor(totalPrizePool * 0.6);
  const second = Math.floor(totalPrizePool * 0.25);
  const third = totalPrizePool - first - second;

  return { first, second, third };
}

export const complete = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();
    
    const competition = await prisma.competition.findUnique({ 
      where: { code }, 
      include: { players: { include: { User: true } } } 
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

    const sortedPlayers = [...competition.players].sort((a, b) => b.score - a.score);
    const prizePool = competition.totalPrizePool;
    const { first, second, third } = calculatePrizeBreakdown(prizePool, sortedPlayers.length);
    
    const winners = sortedPlayers.slice(0, 3).filter(p => p !== undefined);
    const prizeAmounts = [first, second, third];

    const transactionPromises = [];

    // Update competition status and player rankings
    transactionPromises.push(
      prisma.competition.update({ 
        where: { id: competition.id }, 
        data: { status: "COMPLETED" } 
      })
    );

    // Update player rankings
    for (let i = 0; i < sortedPlayers.length; i++) {
      transactionPromises.push(
        prisma.competitionPlayer.update({
          where: { id: sortedPlayers[i].id },
          data: { rank: i + 1 }
        })
      );
    }

    // Distribute prizes to winners
    for (let i = 0; i < winners.length && i < 3; i++) {
      const winner = winners[i];
      const prizeAmount = prizeAmounts[i];
      
      if (prizeAmount > 0) {
        // Create prize transaction
        transactionPromises.push(
          prisma.transaction.create({ 
            data: { 
              walletId: (await WalletOps.getOrCreateWallet(winner.userId)).id,
              type: "PRIZE", 
              amount: prizeAmount, 
              meta: { 
                competitionId: competition.id,
                rank: i + 1,
                competitionTitle: competition.title
              } 
            } 
          })
        );
        
        // Update wallet balance
        transactionPromises.push(
          prisma.wallet.update({ 
            where: { userId: winner.userId }, 
            data: { balance: { increment: prizeAmount } } 
          })
        );
      }
    }

    await prisma.$transaction(transactionPromises);

    const results = {
      winners: winners.map((player, index) => ({
        rank: index + 1,
        username: player.User.username,
        score: player.score,
        prize: prizeAmounts[index] || 0
      })),
      totalPrizePool: prizePool
    };

    res.json({ ok: true, results });
  } catch (e) { 
    next(e); 
  }
};