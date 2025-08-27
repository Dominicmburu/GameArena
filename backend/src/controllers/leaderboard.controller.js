import { prisma } from "../prisma.js";

export const globalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const topPlayers = await prisma.competitionPlayer.groupBy({
      by: ["userId"],
      _sum: { score: true },
      _count: { _all: true },
      _avg: { score: true },
      orderBy: { _sum: { score: "desc" } },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const userIds = topPlayers.map(t => t.userId);
    const users = await prisma.user.findMany({ 
      where: { id: { in: userIds } },
      select: { id: true, username: true, createdAt: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));
    
    const leaderboard = topPlayers.map((player, index) => {
      const user = userMap.get(player.userId);
      return {
        rank: ((Number(page) - 1) * Number(limit)) + index + 1,
        userId: player.userId,
        username: user?.username || 'Unknown',
        totalScore: player._sum.score || 0,
        averageScore: Math.round(player._avg.score || 0),
        tournaments: player._count._all,
        memberSince: user?.createdAt
      };
    });

    res.json(leaderboard);
  } catch (e) {
    next(e);
  }
};

export const competitionLeaderboard = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    
    const competition = await prisma.competition.findUnique({
      where: { code },
      include: {
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

    const leaderboard = competition.players.map((player, index) => ({
      rank: index + 1,
      username: player.User.username,
      score: player.score,
      isReady: player.isReady,
      joinedAt: player.joinedAt
    }));

    res.json({
      competition: {
        title: competition.title,
        status: competition.status,
        totalPrizePool: competition.totalPrizePool
      },
      leaderboard
    });
  } catch (e) {
    next(e);
  }
};