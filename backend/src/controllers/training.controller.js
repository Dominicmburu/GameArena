import { prisma } from "../prisma.js";
import { z } from "zod";

const createTrainingSessionSchema = z.object({
  gameName: z.string().min(1, "Game name is required"),
  score: z.number().int().min(0, "Score cannot be negative"),
  duration: z.number().int().min(0, "Duration cannot be negative")
});

export const createSession = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const body = createTrainingSessionSchema.parse(req.body);
    
    const session = await prisma.trainingSession.create({ 
      data: { 
        userId: uid, 
        ...body 
      } 
    });
    
    res.json(session);
  } catch (e) { 
    next(e); 
  }
};

export const listMyTraining = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20, gameName } = req.query;
    
    const where = {
      userId: uid,
      ...(gameName && { gameName })
    };
    
    const sessions = await prisma.trainingSession.findMany({ 
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    
    res.json(sessions);
  } catch (e) {
    next(e);
  }
};

export const getTrainingStats = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    
    const stats = await prisma.trainingSession.groupBy({
      by: ['gameName'],
      where: { userId: uid },
      _count: { _all: true },
      _sum: { duration: true, score: true },
      _avg: { score: true },
      _max: { score: true }
    });

    const formattedStats = stats.map(stat => ({
      gameName: stat.gameName,
      sessionsPlayed: stat._count._all,
      totalDuration: stat._sum.duration || 0,
      totalScore: stat._sum.score || 0,
      averageScore: Math.round(stat._avg.score || 0),
      bestScore: stat._max.score || 0
    }));

    res.json(formattedStats);
  } catch (e) {
    next(e);
  }
};