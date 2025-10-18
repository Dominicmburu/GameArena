import { prisma } from "../prisma.js";
import { z } from "zod";
import { compare, hash } from "../utils/crypto.js";

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  country: z.string().max(100).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

/**
 * Get current user's profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        profile: true,
        wallet: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      country: user.profile?.country,
      level: user.profile?.level,
      winRate: user.profile?.winRate || 0,
      avatar: '🎮',
      bio: '',
      socialMedia: {},
      preferences: {
        emailNotifications: true,
        competitionAlerts: true,
        achievementNotifications: true,
        marketingEmails: false,
        publicProfile: true,
        showRealName: false,
        showEmail: false,
        language: 'en',
        theme: 'dark'
      },
      wallet: {
        balance: user.wallet?.balance || 0
      },
      createdAt: user.createdAt
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const body = updateProfileSchema.parse(req.body);
    
    // Check if username is taken (if username is being updated)
    if (body.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: body.username,
          NOT: { id: req.user.uid }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          error: "USERNAME_TAKEN",
          message: "Username is already taken"
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.uid },
      data: {
        ...(body.username && { username: body.username }),
        profile: {
          upsert: {
            create: {
              country: body.country,
              level: body.level || 'BEGINNER'
            },
            update: {
              ...(body.country !== undefined && { country: body.country }),
              ...(body.level !== undefined && { level: body.level })
            }
          }
        }
      },
      include: {
        profile: true,
        wallet: true
      }
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      country: updatedUser.profile?.country,
      level: updatedUser.profile?.level,
      winRate: updatedUser.profile?.winRate || 0,
      avatar: '🎮',
      bio: '',
      socialMedia: {},
      preferences: {
        emailNotifications: true,
        competitionAlerts: true,
        achievementNotifications: true,
        marketingEmails: false,
        publicProfile: true,
        showRealName: false,
        showEmail: false,
        language: 'en',
        theme: 'dark'
      }
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Update avatar (stored in memory only since it's not in DB)
 */
export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: "AVATAR_REQUIRED", message: "Avatar is required" });
    }

    // Since avatar is not in the database, just return success
    res.json({
      avatar: avatar,
      message: "Avatar updated (client-side only)"
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Update password
 */
export const updatePassword = async (req, res, next) => {
  try {
    const body = updatePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.uid }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    // Verify current password
    const isValid = await compare(body.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: "INVALID_PASSWORD",
        message: "Current password is incorrect"
      });
    }

    // Update password
    await prisma.user.update({
      where: { id: req.user.uid },
      data: {
        passwordHash: await hash(body.newPassword)
      }
    });

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
};

/**
 * Update preferences (stored in memory only since it's not in DB)
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;

    // Since preferences are not in the database, just return them
    res.json(preferences);
  } catch (e) {
    next(e);
  }
};

/**
 * Get user statistics
 */
export const getStats = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    // Get competition stats
    const competitionStats = await prisma.competitionPlayer.aggregate({
      where: { userId: uid },
      _count: { _all: true },
      _sum: { score: true },
      _avg: { score: true }
    });

    // Get wins (rank = 1)
    const wins = await prisma.competitionPlayer.count({
      where: {
        userId: uid,
        rank: 1
      }
    });

    // Get total prize money
    const prizeData = await prisma.competitionPlayer.findMany({
      where: {
        userId: uid,
        rank: { not: null }
      },
      include: {
        Competition: {
          select: {
            totalPrizePool: true
          }
        }
      }
    });

    // Calculate total prizes (simplified - would need proper prize distribution logic)
    const totalPrize = prizeData.reduce((sum, cp) => {
      if (cp.rank === 1) {
        return sum + (cp.Competition.totalPrizePool * 0.5); // Winner gets 50%
      } else if (cp.rank === 2) {
        return sum + (cp.Competition.totalPrizePool * 0.3); // Second gets 30%
      } else if (cp.rank === 3) {
        return sum + (cp.Competition.totalPrizePool * 0.2); // Third gets 20%
      }
      return sum;
    }, 0);

    // Get global rank
    const allPlayerScores = await prisma.competitionPlayer.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { 
        _sum: { 
          score: 'desc' 
        } 
      }
    });

    const globalRank = allPlayerScores.findIndex(p => p.userId === uid) + 1;

    // Get training stats
    const trainingStats = await prisma.trainingSession.aggregate({
      where: { userId: uid },
      _sum: { duration: true },
      _count: { _all: true }
    });

    // Calculate win rate
    const totalGames = competitionStats._count._all || 0;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    // Get favorite game - Find competitions user has played most
    const userCompetitions = await prisma.competitionPlayer.findMany({
      where: { userId: uid },
      include: {
        Competition: {
          include: {
            game: true
          }
        }
      }
    });

    // Count games
    const gameCount = {};
    userCompetitions.forEach(cp => {
      const gameName = cp.Competition.game.name;
      gameCount[gameName] = (gameCount[gameName] || 0) + 1;
    });

    // Find favorite game
    let favoriteGame = 'N/A';
    let maxCount = 0;
    Object.entries(gameCount).forEach(([game, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = game;
      }
    });

    res.json({
      totalGames,
      wins,
      winRate: Math.round(winRate * 10) / 10,
      totalPrize: Math.round(totalPrize),
      globalRank: globalRank || 0,
      totalHours: Math.round((trainingStats._sum?.duration || 0) / 60),
      achievements: 0,
      averageScore: Math.round(competitionStats._avg?.score || 0),
      totalScore: competitionStats._sum?.score || 0,
      trainingSessions: trainingStats._count?._all || 0,
      favoriteGame
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Get user achievements (returns empty since no Achievement model)
 */
export const getAchievements = async (req, res, next) => {
  try {
    // No Achievement model in your schema, return empty array
    res.json([]);
  } catch (e) {
    next(e);
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "PASSWORD_REQUIRED",
        message: "Password is required to delete account"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.uid }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: "INVALID_PASSWORD",
        message: "Password is incorrect"
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.user.uid }
    });

    res.json({ message: "Account deleted successfully" });
  } catch (e) {
    next(e);
  }
};

/**
 * Get public profile by username
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    // Get basic stats
    const stats = await prisma.competitionPlayer.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _sum: { score: true }
    });

    res.json({
      username: user.username,
      avatar: '🎮',
      bio: '',
      country: user.profile?.country,
      level: user.profile?.level,
      socialMedia: {},
      totalGames: stats._count._all || 0,
      totalScore: stats._sum?.score || 0,
      memberSince: user.createdAt
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Export user data
 */
export const exportData = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.uid },
      include: {
        profile: true,
        wallet: true,
        competitionPlayers: {
          include: {
            Competition: {
              include: { game: true }
            }
          }
        },
        training: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "User not found" });
    }

    const exportData = {
      profile: {
        email: user.email,
        username: user.username,
        country: user.profile?.country,
        level: user.profile?.level,
        winRate: user.profile?.winRate,
        createdAt: user.createdAt
      },
      wallet: {
        balance: user.wallet?.balance || 0
      },
      competitions: user.competitionPlayers.map(cp => ({
        competition: cp.Competition.title,
        game: cp.Competition.game.name,
        score: cp.score,
        rank: cp.rank,
        joinedAt: cp.joinedAt
      })),
      trainingSessions: user.training.map(ts => ({
        gameName: ts.gameName,
        score: ts.score,
        duration: ts.duration,
        createdAt: ts.createdAt
      })),
      exportDate: new Date().toISOString()
    };

    res.json(exportData);
  } catch (e) {
    next(e);
  }
};