import { prisma } from "../prisma.js";

const ACTIVE_STATUSES = ["ONGOING", "UPCOMING"];

/**
 * Homepage stats — four aggregate numbers, served in one round trip.
 * All four queries run in parallel; each is index-served (no scans).
 */
export const getHomepageStats = async (req, res, next) => {
  try {
    const activeCompetitionFilter = {
      privacy: "PUBLIC",
      status: { in: ACTIVE_STATUSES },
    };

    const [activeCompetitions, prizeAgg, playersCompeting, gameCategories] =
      await Promise.all([
        prisma.competition.count({ where: activeCompetitionFilter }),
        prisma.competition.aggregate({
          where: activeCompetitionFilter,
          _sum: { totalPrizePool: true },
        }),
        prisma.competitionPlayer.count({
          where: { Competition: activeCompetitionFilter },
        }),
        prisma.game.count({ where: { isActive: true } }),
      ]);

    res.json({
      activeCompetitions,
      totalPrizePool: prizeAgg._sum.totalPrizePool || 0,
      playersCompeting,
      gameCategories,
    });
  } catch (e) {
    next(e);
  }
};
