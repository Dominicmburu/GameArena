import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";
import { registerSockets } from "./sockets/index.js";
import { startCleanupJob } from "./jobs/cleanup.js";

const app = express();

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (health checks, internal Docker requests, curl)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (env.clientOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log(`❌ CORS blocked origin: ${origin}`);
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Trust proxy for secure cookies behind Nginx/reverse proxies
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// API routes
app.use("/api", routes);

// Development utility endpoints
if (process.env.NODE_ENV === "development") {
    app.get("/api/dev/reset-competitions", async (req, res) => {
        try {
            const { prisma } = await import("./prisma.js");
            await prisma.competitionPlayer.deleteMany();
            await prisma.competition.deleteMany();
            res.json({ message: "All competitions reset" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/dev/seed-games", async (req, res) => {
        try {
            const { prisma } = await import("./prisma.js");

            const games = [
                { name: "Snake", minEntryFee: 100 },
                { name: "Tetris", minEntryFee: 150 },
                { name: "Pac-Man", minEntryFee: 200 },
                { name: "Space Invaders", minEntryFee: 100 },
                { name: "Breakout", minEntryFee: 100 }
            ];

            for (const game of games) {
                await prisma.game.upsert({
                    where: { name: game.name },
                    update: {},
                    create: game
                });
            }

            res.json({ message: "Games seeded successfully", games });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

// 404 handler for API routes
app.use((req, res) => {
    res.status(404).json({
        error: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: env.clientOrigins,
        credentials: true,
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Register socket handlers
registerSockets(io);

// Make socket.io and userSockets available to controllers
app.set('io', io);
app.set('userSockets', io.userSockets);

// Graceful shutdown
const shutdown = async () => {
    console.log("Shutting down gracefully...");

    server.close(() => {
        console.log("HTTP server closed");
    });

    io.close(() => {
        console.log("Socket.io server closed");
    });

    try {
        const { prisma } = await import("./prisma.js");
        await prisma.$disconnect();
        console.log("Database connection closed");
    } catch (error) {
        console.error("Error closing database connection:", error);
    }

    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        const { prisma } = await import("./prisma.js");
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        server.listen(env.port, () => {
            console.log(`🚀 Backend API running on port ${env.port}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🌐 Allowed origins: ${env.clientOrigins.join(", ")}`);
            console.log(`🔒 Cookie secure: ${env.cookieSecure}`);
            console.log(`🍪 Cookie domain: ${env.cookieDomain || "(host-only)"}`);

            startCleanupJob(io);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();