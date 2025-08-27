import React, { useState, useEffect, useRef } from "react";

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const OBSTACLE_SPEED = 6;
const OBSTACLE_INTERVAL = 1500;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DinoGame = () => {
    const [dinoY, setDinoY] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameRef = useRef();

    // Dino jump handler
    const handleJump = () => {
        if (!isJumping && !gameOver) {
            setVelocity(JUMP_STRENGTH);
            setIsJumping(true);
        }
    };

    // Dino physics
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            setDinoY((prevY) => {
                let nextY = prevY + velocity;
                if (nextY >= 0) {
                    setIsJumping(false);
                    setVelocity(0);
                    return 0;
                }
                setVelocity((v) => v + GRAVITY);
                return nextY;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [velocity, isJumping, gameOver]);

    // Obstacles movement
    useEffect(() => {
        if (gameOver) return;
        const moveInterval = setInterval(() => {
            setObstacles((obs) =>
                obs
                    .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
                    .filter((o) => o.x > -40)
            );
        }, 20);
        return () => clearInterval(moveInterval);
    }, [gameOver]);

    // Obstacles spawn
    useEffect(() => {
        if (gameOver) return;
        const spawnInterval = setInterval(() => {
            setObstacles((obs) => [
                ...obs,
                { x: 600, width: getRandomInt(20, 40), height: getRandomInt(30, 60) },
            ]);
        }, OBSTACLE_INTERVAL);
        return () => clearInterval(spawnInterval);
    }, [gameOver]);

    // Collision detection
    useEffect(() => {
        if (gameOver) return;
        obstacles.forEach((o) => {
            if (
                o.x < 60 &&
                o.x + o.width > 20 &&
                dinoY + 40 > 200 - o.height
            ) {
                setGameOver(true);
            }
        });
        if (!gameOver) setScore((s) => s + 1);
    }, [obstacles, dinoY, gameOver]);

    // Restart game
    const handleRestart = () => {
        setDinoY(0);
        setVelocity(0);
        setIsJumping(false);
        setObstacles([]);
        setScore(0);
        setGameOver(false);
    };

    // Keyboard jump
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === "Space") handleJump();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    return (
        <div
            ref={gameRef}
            style={{
                position: "relative",
                width: 600,
                height: 200,
                background: "#f7f7f7",
                overflow: "hidden",
                border: "2px solid #333",
                margin: "20px auto",
            }}
            tabIndex={0}
            onClick={handleJump}
        >
            {/* Dino */}
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    bottom: 0 + dinoY,
                    width: 40,
                    height: 40,
                    background: "#444",
                    borderRadius: "8px",
                }}
            />
            {/* Obstacles */}
            {obstacles.map((o, idx) => (
                <div
                    key={idx}
                    style={{
                        position: "absolute",
                        left: o.x,
                        bottom: 0,
                        width: o.width,
                        height: o.height,
                        background: "#228B22",
                        borderRadius: "4px",
                    }}
                />
            ))}
            {/* Ground */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    height: 10,
                    background: "#888",
                }}
            />
            {/* Score */}
            <div
                style={{
                    position: "absolute",
                    left: 10,
                    top: 10,
                    fontSize: 18,
                    fontWeight: "bold",
                }}
            >
                Score: {score}
            </div>
            {/* Game Over */}
            {gameOver && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "#fff",
                        padding: "20px 40px",
                        border: "2px solid #333",
                        borderRadius: "8px",
                        fontSize: 24,
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                >
                    Game Over
                    <br />
                    <button onClick={handleRestart} style={{ marginTop: 10 }}>
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
};

export default DinoGame;