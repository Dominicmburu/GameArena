import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Alert, ProgressBar } from 'react-bootstrap';
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react';

const DinoGame = ({ competition, onGameEnd }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    isRunning: false,
    score: 0,
    gameSpeed: 6,
    ground: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    dino: {
      x: 50,
      y: 0,
      width: 44,
      height: 44,
      dy: 0,
      jumpForce: 15,
      grounded: false,
      crouching: false
    },
    obstacles: [],
    clouds: [],
    gameOver: false,
    highScore: localStorage.getItem('dinoHighScore') || 0
  });

  const [gameState, setGameState] = useState({
    score: 0,
    isRunning: false,
    gameOver: false,
    timeRemaining: competition?.minutesToPlay * 60 || 300,
    isPaused: false
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const animationFrameRef = useRef();
  const keysRef = useRef({});
  const startTimeRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Game sprites and images (using Canvas drawing for realistic look)
  const drawDino = useCallback((ctx, dino, frame) => {
    const { x, y, width, height, crouching } = dino;
    
    // Dino body
    ctx.fillStyle = '#535353';
    if (crouching) {
      // Crouching dino
      ctx.fillRect(x + 6, y + 20, 32, 24);
      // Head
      ctx.fillRect(x + 6, y + 10, 20, 20);
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 15, y + 15, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 16, y + 16, 2, 2);
    } else {
      // Standing/running dino
      ctx.fillRect(x + 6, y, 14, height);
      ctx.fillRect(x + 20, y + 4, 14, 20);
      ctx.fillRect(x + 20, y + 24, 14, 20);
      
      // Head
      ctx.fillRect(x, y + 4, 20, 16);
      
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y + 8, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 9, y + 9, 2, 2);
      
      // Legs animation
      ctx.fillStyle = '#535353';
      if (frame % 12 < 6) {
        ctx.fillRect(x + 22, y + 34, 4, 10);
        ctx.fillRect(x + 30, y + 36, 4, 8);
      } else {
        ctx.fillRect(x + 22, y + 36, 4, 8);
        ctx.fillRect(x + 30, y + 34, 4, 10);
      }
    }
    
    // Tail
    ctx.fillStyle = '#535353';
    ctx.fillRect(x + 34, y + 6, 10, 4);
  }, []);

  const drawCactus = useCallback((ctx, obstacle) => {
    const { x, y, width, height } = obstacle;
    
    // Main cactus body
    ctx.fillStyle = '#2b7f2b';
    ctx.fillRect(x + width/4, y, width/2, height);
    
    // Cactus arms
    if (width > 20) {
      ctx.fillRect(x, y + height/4, width/3, 8);
      ctx.fillRect(x + 2*width/3, y + height/2, width/3, 8);
    }
    
    // Spikes
    ctx.fillStyle = '#1a5a1a';
    for (let i = 0; i < height; i += 8) {
      ctx.fillRect(x + width/4 - 2, y + i, 2, 4);
      ctx.fillRect(x + 3*width/4, y + i, 2, 4);
    }
  }, []);

  const drawPterodactyl = useCallback((ctx, obstacle, frame) => {
    const { x, y } = obstacle;
    
    ctx.fillStyle = '#535353';
    // Body
    ctx.fillRect(x + 8, y + 8, 16, 8);
    // Head
    ctx.fillRect(x, y + 6, 12, 8);
    // Beak
    ctx.fillRect(x - 4, y + 8, 8, 4);
    
    // Wings animation
    if (frame % 20 < 10) {
      // Wings up
      ctx.fillRect(x + 4, y, 20, 4);
    } else {
      // Wings down
      ctx.fillRect(x + 4, y + 12, 20, 4);
    }
    
    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + 8, 2, 2);
  }, []);

  const drawCloud = useCallback((ctx, cloud) => {
    const { x, y } = cloud;
    
    ctx.fillStyle = '#f0f0f0';
    // Cloud parts
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.arc(x + 12, y, 10, 0, Math.PI * 2);
    ctx.arc(x + 24, y, 8, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 6, 6, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawGround = useCallback((ctx, ground, canvas) => {
    const { x } = ground;
    
    // Ground line
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 25);
    ctx.lineTo(canvas.width, canvas.height - 25);
    ctx.stroke();
    
    // Ground dots pattern
    ctx.fillStyle = '#535353';
    for (let i = x % 20; i < canvas.width; i += 20) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(i + j * 4, canvas.height - 20 + j * 2, 2, 2);
      }
    }
  }, []);

  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const game = gameStateRef.current;
    if (!game.isRunning || game.gameOver) return;

    const ctx = canvas.getContext('2d');
    const currentTime = Date.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
      lastTimeRef.current = currentTime;
    }

    // Update timer
    const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
    const timeRemaining = Math.max(0, (competition?.minutesToPlay * 60 || 300) - elapsedSeconds);
    
    // Check if time is up
    if (timeRemaining <= 0) {
      game.gameOver = true;
      game.isRunning = false;
      
      setGameState(prev => ({
        ...prev,
        isRunning: false,
        gameOver: true,
        timeRemaining: 0
      }));

      if (onGameEnd) {
        onGameEnd({
          score: game.score,
          playTime: elapsedSeconds,
          completed: true
        });
      }
      return;
    }

    // Update game speed based on score
    game.gameSpeed = 6 + Math.floor(game.score / 100);

    // Update ground
    game.ground.x -= game.gameSpeed;
    if (game.ground.x <= -20) game.ground.x = 0;

    // Update dino physics
    if (keysRef.current.space || keysRef.current.arrowUp) {
      if (game.dino.grounded) {
        game.dino.dy = -game.dino.jumpForce;
        game.dino.grounded = false;
      }
    }

    if (keysRef.current.arrowDown) {
      game.dino.crouching = true;
      if (!game.dino.grounded) {
        game.dino.dy += 2; // Faster fall when crouching in air
      }
    } else {
      game.dino.crouching = false;
    }

    // Apply gravity
    if (!game.dino.grounded) {
      game.dino.dy += 0.8;
      game.dino.y += game.dino.dy;
    }

    // Ground collision detection
    const groundY = canvas.height - 70;
    if (game.dino.y >= groundY) {
      game.dino.y = groundY;
      game.dino.dy = 0;
      game.dino.grounded = true;
    }

    // Spawn obstacles randomly
    if (Math.random() < 0.005 + (game.score / 50000)) {
      const obstacleType = Math.random();
      if (obstacleType < 0.7) {
        // Spawn cactus
        game.obstacles.push({
          x: canvas.width,
          y: groundY,
          width: 20 + Math.random() * 20,
          height: 40 + Math.random() * 20,
          type: 'cactus'
        });
      } else {
        // Spawn pterodactyl
        game.obstacles.push({
          x: canvas.width,
          y: groundY - 50 - Math.random() * 50,
          width: 32,
          height: 16,
          type: 'pterodactyl'
        });
      }
    }

    // Spawn clouds occasionally
    if (Math.random() < 0.002) {
      game.clouds.push({
        x: canvas.width,
        y: 50 + Math.random() * 100,
        speed: 1 + Math.random()
      });
    }

    // Update obstacles and check collisions
    game.obstacles = game.obstacles.filter(obstacle => {
      obstacle.x -= game.gameSpeed;
      
      // Collision detection with more precise hitboxes
      const dinoRect = {
        x: game.dino.x + 6,
        y: game.dino.y + (game.dino.crouching ? 10 : 0),
        width: game.dino.width - 12,
        height: game.dino.height - (game.dino.crouching ? 10 : 0)
      };
      
      const obstacleRect = {
        x: obstacle.x + 4,
        y: obstacle.y + 4,
        width: obstacle.width - 8,
        height: obstacle.height - 8
      };

      // Check for collision
      if (dinoRect.x < obstacleRect.x + obstacleRect.width &&
          dinoRect.x + dinoRect.width > obstacleRect.x &&
          dinoRect.y < obstacleRect.y + obstacleRect.height &&
          dinoRect.y + dinoRect.height > obstacleRect.y) {
        
        // Game over due to collision
        game.gameOver = true;
        game.isRunning = false;
        
        setGameState(prev => ({
          ...prev,
          isRunning: false,
          gameOver: true
        }));

        if (onGameEnd) {
          onGameEnd({
            score: game.score,
            playTime: elapsedSeconds,
            completed: false,
            reason: 'collision'
          });
        }
        return false;
      }

      return obstacle.x > -obstacle.width;
    });

    // Update clouds
    game.clouds = game.clouds.filter(cloud => {
      cloud.x -= cloud.speed;
      return cloud.x > -40;
    });

    // Update score (1 point per frame)
    game.score += 1;
    
    // Score milestone effects
    if (game.score % 100 === 0) {
      // Could add sound effects or visual feedback here
      console.log(`Score milestone: ${game.score}`);
    }

    // Update high score
    if (game.score > game.highScore) {
      game.highScore = game.score;
      localStorage.setItem('dinoHighScore', game.score);
    }

    // Update React state
    setGameState(prev => ({
      ...prev,
      score: game.score,
      timeRemaining
    }));

    // Clear canvas and draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f7f7f7');
    gradient.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    game.clouds.forEach(cloud => drawCloud(ctx, cloud));
    
    // Draw ground
    drawGround(ctx, game.ground, canvas);
    
    // Draw dino
    drawDino(ctx, game.dino, Math.floor(currentTime / 100));
    
    // Draw obstacles
    game.obstacles.forEach(obstacle => {
      if (obstacle.type === 'cactus') {
        drawCactus(ctx, obstacle);
      } else if (obstacle.type === 'pterodactyl') {
        drawPterodactyl(ctx, obstacle, Math.floor(currentTime / 100));
      }
    });
    
    // Draw UI elements
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `HI ${String(game.highScore).padStart(5, '0')} ${String(game.score).padStart(5, '0')}`,
      canvas.width - 20,
      30
    );

    // Draw time remaining
    ctx.textAlign = 'left';
    ctx.fillStyle = timeRemaining < 30 ? '#ff0000' : '#535353';
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    ctx.fillText(
      `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      20,
      30
    );

    // Continue game loop
    if (game.isRunning && !game.gameOver) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
  }, [competition, onGameEnd, drawDino, drawCactus, drawPterodactyl, drawCloud, drawGround]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e) => {
    switch (e.code) {
      case 'Space':
      case 'ArrowUp':
        e.preventDefault();
        keysRef.current.space = true;
        keysRef.current.arrowUp = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        keysRef.current.arrowDown = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    switch (e.code) {
      case 'Space':
      case 'ArrowUp':
        e.preventDefault();
        keysRef.current.space = false;
        keysRef.current.arrowUp = false;
        break;
      case 'ArrowDown':
        e.preventDefault();
        keysRef.current.arrowDown = false;
        break;
    }
  }, []);

  // Game control functions
  const startGame = useCallback(() => {
    if (!competition) {
      alert('No competition selected');
      return;
    }

    const game = gameStateRef.current;
    
    // Reset game state
    game.score = 0;
    game.gameSpeed = 6;
    game.obstacles = [];
    game.clouds = [];
    game.gameOver = false;
    game.isRunning = true;
    
    // Reset dino position
    const canvas = canvasRef.current;
    if (canvas) {
      game.dino.y = canvas.height - 70;
      game.dino.dy = 0;
      game.dino.grounded = true;
      game.dino.crouching = false;
    }

    // Reset timers
    startTimeRef.current = null;
    lastTimeRef.current = null;
    
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      gameOver: false,
      score: 0,
      timeRemaining: competition?.minutesToPlay * 60 || 300,
      isPaused: false
    }));

    setShowInstructions(false);
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, [competition, updateGame]);

  const pauseGame = useCallback(() => {
    const game = gameStateRef.current;
    game.isRunning = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setGameState(prev => ({ ...prev, isPaused: true, isRunning: false }));
  }, []);

  const resumeGame = useCallback(() => {
    const game = gameStateRef.current;
    if (!game.gameOver) {
      game.isRunning = true;
      setGameState(prev => ({ ...prev, isPaused: false, isRunning: true }));
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
  }, [updateGame]);

  const resetGame = useCallback(() => {
    const game = gameStateRef.current;
    game.isRunning = false;
    game.gameOver = false;
    game.score = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setGameState({
      score: 0,
      isRunning: false,
      gameOver: false,
      timeRemaining: competition?.minutesToPlay * 60 || 300,
      isPaused: false
    });
    
    setShowInstructions(true);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw initial state
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f7f7f7');
      gradient.addColorStop(1, '#e8e8e8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGround(ctx, { x: 0 }, canvas);
      
      game.dino.y = canvas.height - 70;
      game.dino.dy = 0;
      game.dino.grounded = true;
      game.dino.crouching = false;
      
      drawDino(ctx, game.dino, 0);
    }
  }, [competition, drawGround, drawDino]);

  // Initialize canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 200;
    
    // Initialize ground position
    gameStateRef.current.ground.y = canvas.height - 25;
    gameStateRef.current.dino.y = canvas.height - 70;

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Initial draw
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f7f7f7');
    gradient.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGround(ctx, { x: 0 }, canvas);
    drawDino(ctx, gameStateRef.current.dino, 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, drawGround, drawDino]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dino-game-container">
      <div className="game-header mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-white mb-1">Chrome Dino Game</h4>
            <small className="text-grey">Competition: {competition?.title}</small>
          </div>
          <div className="game-stats d-flex gap-3">
            <div className="text-center">
              <div className="text-neon fw-bold">{gameState.score}</div>
              <small className="text-grey">Score</small>
            </div>
            <div className="text-center">
              <div className={`fw-bold ${gameState.timeRemaining < 30 ? 'text-danger' : 'text-white'}`}>
                {formatTime(gameState.timeRemaining)}
              </div>
              <small className="text-grey">Time</small>
            </div>
            <div className="text-center">
              <div className="text-purple fw-bold">{gameStateRef.current.highScore}</div>
              <small className="text-grey">Best</small>
            </div>
          </div>
        </div>
        
        {gameState.timeRemaining > 0 && (
          <ProgressBar 
            now={(gameState.timeRemaining / (competition?.minutesToPlay * 60 || 300)) * 100}
            variant={gameState.timeRemaining < 30 ? 'danger' : 'info'}
            className="mt-2"
            style={{ height: '4px' }}
          />
        )}
      </div>

      {showInstructions && (
        <Alert variant="info" className="mb-3">
          <div className="d-flex align-items-center">
            <Trophy size={20} className="me-2" />
            <div>
              <strong>How to Play:</strong> Press SPACE or ↑ to jump, ↓ to crouch. 
              Avoid cacti and pterodactyls to score points!
            </div>
          </div>
        </Alert>
      )}

      <div className="game-canvas-container">
        <canvas 
          ref={canvasRef}
          className="game-canvas"
          style={{
            border: '2px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '8px',
            backgroundColor: '#f7f7f7',
            display: 'block',
            margin: '0 auto'
          }}
        />
        
        {gameState.gameOver && (
          <div className="game-over-overlay">
            <div className="text-center">
              <h3 className="text-white mb-3">Game Over!</h3>
              <p className="text-grey mb-3">
                Final Score: <span className="text-neon fw-bold">{gameState.score}</span>
              </p>
              <Button 
                className="btn-cyber me-2"
                onClick={resetGame}
              >
                <RotateCcw size={18} className="me-2" />
                Play Again
              </Button>
            </div>
          </div>
        )}
        
        {gameState.isPaused && !gameState.gameOver && (
          <div className="game-paused-overlay">
            <div className="text-center">
              <h4 className="text-white mb-3">Game Paused</h4>
              <Button 
                className="btn-cyber"
                onClick={resumeGame}
              >
                <Play size={18} className="me-2" />
                Resume
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls mt-3 text-center">
        {!gameState.isRunning && !gameState.gameOver && !showInstructions && (
          <Button 
            className="btn-cyber me-2"
            onClick={resumeGame}
          >
            <Play size={18} className="me-2" />
            Resume
          </Button>
        )}
        
        {showInstructions && (
          <Button 
            className="btn-cyber me-2"
            onClick={startGame}
            size="lg"
          >
            <Play size={20} className="me-2" />
            Start Game
          </Button>
        )}
        
        {gameState.isRunning && !gameState.gameOver && (
          <Button 
            variant="outline-light"
            onClick={pauseGame}
            className="me-2"
          >
            <Pause size={18} className="me-2" />
            Pause
          </Button>
        )}
        
        <Button 
          variant="outline-secondary"
          onClick={resetGame}
        >
          <RotateCcw size={18} className="me-2" />
          Reset
        </Button>
      </div>

      <div className="game-instructions mt-3 text-center">
        <small className="text-grey">
          Use SPACEBAR or ↑ to jump • ↓ to crouch • Avoid obstacles to score points
        </small>
      </div>

      <style jsx>{`
        .dino-game-container {
          background: rgba(14, 14, 16, 0.9);
          border-radius: 12px;
          padding: 20px;
          position: relative;
        }

        .game-canvas-container {
          position: relative;
          display: inline-block;
        }

        .game-canvas {
          cursor: crosshair;
        }

        .game-over-overlay,
        .game-paused-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .text-neon { color: #00F0FF; }
        .text-purple { color: #9B00FF; }
        .text-grey { color: #B0B0B0; }

        .btn-cyber {
          background: linear-gradient(45deg, #00F0FF, #9B00FF);
          border: none;
          color: #0E0E10;
          font-weight: bold;
          padding: 8px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-cyber:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 240, 255, 0.4);
          color: #0E0E10;
        }
      `}</style>
    </div>
  );
};

export default DinoGame;