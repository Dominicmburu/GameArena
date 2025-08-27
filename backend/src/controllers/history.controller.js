import { prisma } from "../prisma.js";

export const myHistory = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20 } = req.query;
    
    const competitions = await prisma.competitionPlayer.findMany({ 
      where: { userId: uid },
      include: { 
        Competition: {
          include: {
            game: { select: { name: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    
    const formattedHistory = competitions.map(cp => ({
      id: cp.id,
      competitionId: cp.Competition.id,
      title: cp.Competition.title,
      gameName: cp.Competition.game.name,
      status: cp.Competition.status,
      score: cp.score,
      rank: cp.rank,
      entryFee: cp.Competition.entryFee,
      totalPrizePool: cp.Competition.totalPrizePool,
      joinedAt: cp.joinedAt,
      startsAt: cp.Competition.startsAt,
      endsAt: cp.Competition.endsAt
    }));
    
    res.json(formattedHistory);
  } catch (e) {
    next(e);
  }
};