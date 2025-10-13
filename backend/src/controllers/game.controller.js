import { prisma } from "../prisma.js";
import { z } from "zod";

export const listGames = async (req, res, next) => {
    try {
        const {
            gameType,
            level,
            isPopular,
            isActive,
            minPlayers,
            maxPlayers,
            page = 1,
            limit = 20
        } = req.query;

        const parseBool = (v) =>
            v === true || v === 'true' || v === 1 || v === '1';

        const where = {
            ...(isActive === undefined
                ? { isActive: true }
                : { isActive: parseBool(isActive) }),
            ...(gameType && { gameType }),
            ...(level && { level }),
            ...(isPopular !== undefined && { isPopular: isPopular === 'true' }),
            ...(minPlayers && { maxPlayers: { gte: Number(minPlayers) } }),
            ...(maxPlayers && { minPlayers: { lte: Number(maxPlayers) } })
        };

        const games = await prisma.game.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                minEntryFee: true,
                isPopular: true,
                imageUrl: true,
                _count: {
                    select: {
                        competitions: {
                            where: {
                                status: { in: ["UPCOMING", "ONGOING"] }
                            }
                        }
                    }
                }
            },
            orderBy: [
                { isPopular: "desc" },
                { name: "asc" }
            ],
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const formattedGames = games.map(game => ({
            id: game.id,
            name: game.name,
            description: game.description,
            gameType: game.gameType,
            level: game.level,
            playerRange: `${game.minPlayers}-${game.maxPlayers}`,
            minEntryFee: game.minEntryFee,
            isPopular: game.isPopular,
            imageUrl: game.imageUrl,
            activeCompetitions: game._count.competitions
        }));

        res.json({
            games: formattedGames,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: formattedGames.length
            }
        });
    } catch (e) {
        next(e);
    }
};

export const getGame = async (req, res, next) => {
    try {
        const { id } = req.params;

        const game = await prisma.game.findUnique({
            where: { id },
            include: {
                competitions: {
                    where: {
                        privacy: "PUBLIC",
                        status: { in: ["UPCOMING", "ONGOING"] }
                    },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        maxPlayers: true,
                        entryFee: true,
                        totalPrizePool: true,
                        code: true,
                        expiresAt: true,
                        createdAt: true,
                        creator: {
                            select: { username: true }
                        },
                        _count: {
                            select: { players: true }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });

        if (!game) {
            return res.status(404).json({
                error: "GAME_NOT_FOUND",
                message: "Game not found"
            });
        }

        const now = new Date();

        const formattedGame = {
            id: game.id,
            name: game.name,
            description: game.description,
            gameType: game.gameType,
            level: game.level,
            playerRange: `${game.minPlayers}-${game.maxPlayers}`,
            minEntryFee: game.minEntryFee,
            isPopular: game.isPopular,
            imageUrl: game.imageUrl,
            isActive: game.isActive,
            competitions: game.competitions.map(c => ({
                id: c.id,
                title: c.title,
                status: c.status,
                maxPlayers: c.maxPlayers,
                currentPlayers: c._count.players,
                entryFee: c.entryFee,
                totalPrizePool: c.totalPrizePool,
                code: c.code,
                createdAt: c.createdAt,
                expiresAt: c.expiresAt,
                timeRemaining: Math.max(0, Math.floor((c.expiresAt - now) / 1000)),
                creator: c.creator.username
            }))
        };

        res.json(formattedGame);
    } catch (e) {
        next(e);
    }
};

export const getGameCompetitions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, status } = req.query;

        const game = await prisma.game.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                minPlayers: true,
                maxPlayers: true
            }
        });

        if (!game) {
            return res.status(404).json({
                error: "GAME_NOT_FOUND",
                message: "Game not found"
            });
        }

        const where = {
            gameId: id,
            privacy: "PUBLIC",
            ...(status && { status })
        };

        const competitions = await prisma.competition.findMany({
            where,
            select: {
                id: true,
                title: true,
                status: true,
                maxPlayers: true,
                entryFee: true,
                totalPrizePool: true,
                code: true,
                createdAt: true,
                expiresAt: true,
                creator: {
                    select: { username: true }
                },
                _count: {
                    select: { players: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const now = new Date();

        const formattedCompetitions = competitions.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            maxPlayers: c.maxPlayers,
            currentPlayers: c._count.players,
            entryFee: c.entryFee,
            totalPrizePool: c.totalPrizePool,
            code: c.code,
            createdAt: c.createdAt,
            expiresAt: c.expiresAt,
            timeRemaining: Math.max(0, Math.floor((c.expiresAt - now) / 1000)),
            creator: c.creator.username,
            gameName: game.name
        }));

        res.json({
            game: {
                id: game.id,
                name: game.name,
                playerRange: `${game.minPlayers}-${game.maxPlayers}`
            },
            competitions: formattedCompetitions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: competitions.length
            }
        });
    } catch (e) {
        next(e);
    }
};

const createGameSchema = z.object({
    name: z.string().min(2, "Game name must be at least 2 characters").max(100, "Game name cannot exceed 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters").optional(),
    gameType: z.enum(["ACTION", "ADVENTURE", "PUZZLE", "STRATEGY", "RACING", "SPORTS", "RPG", "SIMULATION", "ARCADE", "TRIVIA", "CARD", "BOARD"]),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    minPlayers: z.number().int().min(1, "Minimum players must be at least 1"),
    maxPlayers: z.number().int().min(1, "Maximum players must be at least 1"),
    minEntryFee: z.number().int().min(0, "Minimum entry fee cannot be negative").default(0),
    isPopular: z.boolean().default(false),
    imageUrl: z.string().url("Invalid image URL").optional()
}).refine(data => data.maxPlayers >= data.minPlayers, {
    message: "Maximum players must be greater than or equal to minimum players",
    path: ["maxPlayers"]
});

export const createGame = async (req, res, next) => {
    try {
        const body = createGameSchema.parse(req.body);

        const existingGame = await prisma.game.findUnique({
            where: { name: body.name }
        });

        if (existingGame) {
            return res.status(400).json({
                error: "GAME_EXISTS",
                message: "A game with this name already exists"
            });
        }

        const game = await prisma.game.create({
            data: body,
            select: {
                id: true,
                name: true,
                description: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                minEntryFee: true,
                isPopular: true,
                imageUrl: true,
                isActive: true,
                createdAt: true
            }
        });

        res.status(201).json(game);
    } catch (e) {
        next(e);
    }
};

const updateGameSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    gameType: z.enum(["ACTION", "ADVENTURE", "PUZZLE", "STRATEGY", "RACING", "SPORTS", "RPG", "SIMULATION", "ARCADE", "TRIVIA", "CARD", "BOARD"]).optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
    minPlayers: z.number().int().min(1).optional(),
    maxPlayers: z.number().int().min(1).optional(),
    minEntryFee: z.number().int().min(0).optional(),
    isPopular: z.boolean().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional()
}).refine(data => {
    if (data.minPlayers !== undefined && data.maxPlayers !== undefined) {
        return data.maxPlayers >= data.minPlayers;
    }
    return true;
}, {
    message: "Maximum players must be greater than or equal to minimum players",
    path: ["maxPlayers"]
});

export const updateGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = updateGameSchema.parse(req.body);

        const existingGame = await prisma.game.findUnique({ where: { id } });
        if (!existingGame) {
            return res.status(404).json({
                error: "GAME_NOT_FOUND",
                message: "Game not found"
            });
        }

        if (body.name && body.name !== existingGame.name) {
            const nameExists = await prisma.game.findUnique({
                where: { name: body.name }
            });

            if (nameExists) {
                return res.status(400).json({
                    error: "GAME_EXISTS",
                    message: "A game with this name already exists"
                });
            }
        }

        const minPlayers = body.minPlayers ?? existingGame.minPlayers;
        const maxPlayers = body.maxPlayers ?? existingGame.maxPlayers;

        if (maxPlayers < minPlayers) {
            return res.status(400).json({
                error: "INVALID_PLAYER_RANGE",
                message: "Maximum players must be greater than or equal to minimum players"
            });
        }

        const updatedGame = await prisma.game.update({
            where: { id },
            data: body,
            select: {
                id: true,
                name: true,
                description: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                minEntryFee: true,
                isPopular: true,
                imageUrl: true,
                isActive: true,
                updatedAt: true
            }
        });

        res.json(updatedGame);
    } catch (e) {
        next(e);
    }
};

export const deleteGame = async (req, res, next) => {
    try {
        const { id } = req.params;

        const game = await prisma.game.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        competitions: {
                            where: {
                                status: { in: ["UPCOMING", "ONGOING"] }
                            }
                        }
                    }
                }
            }
        });

        if (!game) {
            return res.status(404).json({
                error: "GAME_NOT_FOUND",
                message: "Game not found"
            });
        }

        if (game._count.competitions > 0) {
            return res.status(400).json({
                error: "GAME_HAS_ACTIVE_COMPETITIONS",
                message: "Cannot delete game with active competitions"
            });
        }

        await prisma.game.delete({ where: { id } });

        res.json({
            ok: true,
            message: "Game deleted successfully"
        });
    } catch (e) {
        next(e);
    }
};

export const getGameStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        const game = await prisma.game.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                minEntryFee: true,
                isPopular: true,
                imageUrl: true,
                _count: {
                    select: {
                        competitions: true
                    }
                }
            }
        });

        if (!game) {
            return res.status(404).json({
                error: "GAME_NOT_FOUND",
                message: "Game not found"
            });
        }

        const statusCounts = await prisma.competition.groupBy({
            by: ['status'],
            where: { gameId: id },
            _count: { status: true }
        });

        const completedCompetitions = await prisma.competition.findMany({
            where: {
                gameId: id,
                status: "COMPLETED"
            },
            select: { totalPrizePool: true }
        });

        const totalPrizesAwarded = completedCompetitions.reduce(
            (sum, comp) => sum + comp.totalPrizePool,
            0
        );

        const totalPlayers = await prisma.competitionPlayer.count({
            where: {
                Competition: { gameId: id }
            }
        });

        const avgStats = await prisma.competition.aggregate({
            where: { gameId: id },
            _avg: {
                entryFee: true,
                totalPrizePool: true
            }
        });

        const stats = {
            game: {
                id: game.id,
                name: game.name,
                description: game.description,
                gameType: game.gameType,
                level: game.level,
                playerRange: `${game.minPlayers}-${game.maxPlayers}`,
                minEntryFee: game.minEntryFee,
                isPopular: game.isPopular,
                imageUrl: game.imageUrl
            },
            totalCompetitions: game._count.competitions,
            totalPlayers,
            totalPrizesAwarded,
            averageEntryFee: Math.round(avgStats._avg.entryFee || 0),
            averagePrizePool: Math.round(avgStats._avg.totalPrizePool || 0),
            statusBreakdown: statusCounts.reduce((acc, item) => {
                acc[item.status.toLowerCase()] = item._count.status;
                return acc;
            }, {})
        };

        res.json(stats);
    } catch (e) {
        next(e);
    }
};

export const getGameTypes = async (req, res, next) => {
    try {
        const gameTypes = [
            "ACTION", "ADVENTURE", "PUZZLE", "STRATEGY",
            "RACING", "SPORTS", "RPG", "SIMULATION",
            "ARCADE", "TRIVIA", "CARD", "BOARD"
        ];

        const typeCounts = await prisma.game.groupBy({
            by: ['gameType'],
            where: { isActive: true },
            _count: { gameType: true }
        });

        const formattedTypes = gameTypes.map(type => ({
            type,
            count: typeCounts.find(t => t.gameType === type)?._count.gameType || 0
        }));

        res.json(formattedTypes);
    } catch (e) {
        next(e);
    }
};

export const getPopularGames = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const games = await prisma.game.findMany({
            where: {
                isActive: true,
                isPopular: true
            },
            select: {
                id: true,
                name: true,
                description: true,
                gameType: true,
                level: true,
                minPlayers: true,
                maxPlayers: true,
                imageUrl: true,
                _count: {
                    select: {
                        competitions: {
                            where: {
                                status: { in: ["UPCOMING", "ONGOING"] }
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    competitions: {
                        _count: "desc"
                    }
                },
                { name: "asc" }
            ],
            take: Number(limit)
        });

        const formattedGames = games.map(game => ({
            id: game.id,
            name: game.name,
            description: game.description,
            gameType: game.gameType,
            level: game.level,
            playerRange: `${game.minPlayers}-${game.maxPlayers}`,
            imageUrl: game.imageUrl,
            activeCompetitions: game._count.competitions
        }));

        res.json(formattedGames);
    } catch (e) {
        next(e);
    }
};