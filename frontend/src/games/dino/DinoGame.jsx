import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../../styles/DinoGame.css';

import groundImg from '../../assets/images/games/dino/ground.png';
import dinoStationary from '../../assets/images/games/dino/dino-stationary.png';
import dinoRun0 from '../../assets/images/games/dino/dino-run-0.png';
import dinoRun1 from '../../assets/images/games/dino/dino-run-1.png';
import dinoLose from '../../assets/images/games/dino/dino-lose.png';
import cactusImg from '../../assets/images/games/dino/cactus.png';

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;
const SPEED_SCALE_INCREASE = 0.00001;
const GROUND_SPEED = 0.05;
const CACTUS_SPEED = 0.05;
const CACTUS_INTERVAL_MIN = 500;
const CACTUS_INTERVAL_MAX = 2000;
const JUMP_SPEED = 0.45;
const GRAVITY = 0.0015;
const DINO_FRAME_COUNT = 2;
const FRAME_TIME = 100;

const DinoGame = ({ onGameEnd, competitionCode }) => {
  const worldRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.log('DinoGame received competitionCode:', competitionCode);
    console.log('Type:', typeof competitionCode);
    console.log('Is object?', typeof competitionCode === 'object');
  }, [competitionCode]);

  // Game state refs
  const gameStateRef = useRef({
    lastTime: null,
    speedScale: 1,
    score: 0,
    grounds: [{ left: 0 }, { left: 300 }],
    dino: {
      bottom: 0,
      yVelocity: 0,
      isJumping: false,
      frame: 0,
      currentFrameTime: 0,
      src: dinoStationary
    },
    cacti: [],
    nextCactusTime: CACTUS_INTERVAL_MIN,
    animationId: null
  });

  // Helper functions
  const getCustomProperty = (value) => value;

  const setCustomProperty = (obj, prop, value) => {
    obj[prop] = value;
  };

  const incrementCustomProperty = (obj, prop, inc) => {
    obj[prop] = getCustomProperty(obj[prop]) + inc;
  };

  const randomNumberBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // Ground functions
  const setupGround = useCallback(() => {
    gameStateRef.current.grounds = [{ left: 0 }, { left: 300 }];
  }, []);

  const updateGround = useCallback((delta, speedScale) => {
    const state = gameStateRef.current;
    state.grounds.forEach(ground => {
      incrementCustomProperty(ground, 'left', delta * speedScale * GROUND_SPEED * -1);
      if (getCustomProperty(ground.left) <= -300) {
        incrementCustomProperty(ground, 'left', 600);
      }
    });
  }, []);

  // Dino functions
  const setupDino = useCallback(() => {
    const state = gameStateRef.current;
    state.dino = {
      bottom: 0,
      yVelocity: 0,
      isJumping: false,
      frame: 0,
      currentFrameTime: 0,
      src: dinoStationary
    };
  }, []);

  const handleJump = useCallback(() => {
    const dino = gameStateRef.current.dino;
    if (dino.isJumping) return;
    dino.yVelocity = JUMP_SPEED;
    dino.isJumping = true;
  }, []);

  const updateDino = useCallback((delta, speedScale) => {
    const dino = gameStateRef.current.dino;

    // Handle run animation
    if (dino.isJumping) {
      dino.src = dinoStationary;
    } else {
      if (dino.currentFrameTime >= FRAME_TIME) {
        dino.frame = (dino.frame + 1) % DINO_FRAME_COUNT;
        dino.src = dino.frame === 0 ? dinoRun0 : dinoRun1;
        dino.currentFrameTime -= FRAME_TIME;
      }
      dino.currentFrameTime += delta * speedScale;
    }

    // Handle jump
    if (dino.isJumping) {
      incrementCustomProperty(dino, 'bottom', dino.yVelocity * delta);

      if (getCustomProperty(dino.bottom) <= 0) {
        setCustomProperty(dino, 'bottom', 0);
        dino.isJumping = false;
      }

      dino.yVelocity -= GRAVITY * delta;
    }
  }, []);

  const getDinoRect = useCallback(() => {
    const dino = gameStateRef.current.dino;
    const worldWidth = worldRef.current?.offsetWidth || 0;
    const worldHeight = worldRef.current?.offsetHeight || 0;

    const dinoHeight = worldHeight * 0.3;
    const dinoWidth = dinoHeight * 0.8;
    const dinoLeft = worldWidth * 0.01;
    const dinoBottom = (dino.bottom / 100) * worldHeight;

    return {
      left: dinoLeft,
      right: dinoLeft + dinoWidth,
      top: worldHeight - dinoBottom - dinoHeight,
      bottom: worldHeight - dinoBottom
    };
  }, []);

  // Cactus functions
  const setupCactus = useCallback(() => {
    gameStateRef.current.cacti = [];
    gameStateRef.current.nextCactusTime = CACTUS_INTERVAL_MIN;
  }, []);

  const createCactus = useCallback(() => {
    const cactus = { left: 100, id: Date.now() };
    gameStateRef.current.cacti.push(cactus);
  }, []);

  const updateCactus = useCallback((delta, speedScale) => {
    const state = gameStateRef.current;

    state.cacti = state.cacti.filter(cactus => {
      incrementCustomProperty(cactus, 'left', delta * speedScale * CACTUS_SPEED * -1);
      return getCustomProperty(cactus.left) > -100;
    });

    if (state.nextCactusTime <= 0) {
      createCactus();
      state.nextCactusTime = randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale;
    }
    state.nextCactusTime -= delta;
  }, [createCactus]);

  const getCactusRects = useCallback(() => {
    const worldWidth = worldRef.current?.offsetWidth || 0;
    const worldHeight = worldRef.current?.offsetHeight || 0;
    const cactusHeight = worldHeight * 0.3;
    const cactusWidth = cactusHeight * 0.5;

    return gameStateRef.current.cacti.map(cactus => {
      const cactusLeft = (cactus.left / 100) * worldWidth;
      return {
        left: cactusLeft,
        right: cactusLeft + cactusWidth,
        top: worldHeight - cactusHeight,
        bottom: worldHeight
      };
    });
  }, []);

  // Collision detection
  const isCollision = (rect1, rect2) => {
    return (
      rect1.left < rect2.right &&
      rect1.top < rect2.bottom &&
      rect1.right > rect2.left &&
      rect1.bottom > rect2.top
    );
  };

  const checkLose = useCallback(() => {
    const dinoRect = getDinoRect();
    return getCactusRects().some(rect => isCollision(rect, dinoRect));
  }, [getDinoRect, getCactusRects]);

  // Game loop
  const updateSpeedScale = useCallback((delta) => {
    gameStateRef.current.speedScale += delta * SPEED_SCALE_INCREASE;
  }, []);

  const updateScore = useCallback((delta) => {
    gameStateRef.current.score += delta * 0.01;
    setScore(Math.floor(gameStateRef.current.score));
  }, []);

  const handleLose = useCallback(() => {
    const state = gameStateRef.current;
    state.dino.src = dinoLose;
    setGameOver(true);

    // Cancel animation
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
    }

    // ADD LOGGING HERE
    console.log('Game ending with:', {
      score: Math.floor(state.score),
      competitionCode: competitionCode,
      competitionCodeType: typeof competitionCode
    });

    // Call parent callback with final score
    if (onGameEnd) {
      onGameEnd({
        score: Math.floor(state.score),
        competitionCode: competitionCode
      });
    }
  }, [onGameEnd, competitionCode]);

  const update = useCallback((time) => {
    const state = gameStateRef.current;

    if (state.lastTime == null) {
      state.lastTime = time;
      state.animationId = requestAnimationFrame(update);
      return;
    }

    const delta = time - state.lastTime;

    updateGround(delta, state.speedScale);
    updateDino(delta, state.speedScale);
    updateCactus(delta, state.speedScale);
    updateSpeedScale(delta);
    updateScore(delta);

    if (checkLose()) {
      handleLose();
      return;
    }

    state.lastTime = time;
    state.animationId = requestAnimationFrame(update);
  }, [updateGround, updateDino, updateCactus, updateSpeedScale, updateScore, checkLose, handleLose]);

  const handleStart = useCallback(() => {
    const state = gameStateRef.current;
    state.lastTime = null;
    state.speedScale = 1;
    state.score = 0;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);

    setupGround();
    setupDino();
    setupCactus();

    state.animationId = requestAnimationFrame(update);
  }, [setupGround, setupDino, setupCactus, update]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        handleStart();
      } else if (gameStarted && !gameOver && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        handleJump();
      } else if (gameOver && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        handleRestart();
      }
    };

    const handleClick = () => {
      if (!gameStarted) {
        handleStart();
      } else if (gameStarted && !gameOver) {
        handleJump();
      } else if (gameOver) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    worldRef.current?.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      worldRef.current?.removeEventListener('click', handleClick);

      // Cleanup animation
      const state = gameStateRef.current;
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
    };
  }, [gameStarted, gameOver, handleStart, handleJump, handleRestart]);

  // Responsive sizing
  useEffect(() => {
    const setPixelToWorldScale = () => {
      if (!worldRef.current) return;

      let worldToPixelScale;
      if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH;
      } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
      }

      worldRef.current.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
      worldRef.current.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
    };

    setPixelToWorldScale();
    window.addEventListener('resize', setPixelToWorldScale);

    return () => {
      window.removeEventListener('resize', setPixelToWorldScale);
    };
  }, []);

  const state = gameStateRef.current;

  return (
    <div className="dino-game-container">
      <div className="world" ref={worldRef}>
        {/* Score */}
        <div className="score">{score}</div>

        {/* Start/Game Over Screen */}
        {!gameStarted && (
          <div className="start-screen">
            Press Space or Click to Start
          </div>
        )}
        {gameOver && (
          <div className="start-screen">
            Game Over! Score: {score}
            <br />
            <small>Press Space or Click to Restart</small>
          </div>
        )}

        {/* Ground */}
        {state.grounds.map((ground, index) => (
          <img
            key={index}
            src={groundImg}
            className="ground"
            alt="ground"
            style={{ left: `${ground.left}%` }}
          />
        ))}

        {/* Dino */}
        <img
          src={state.dino.src}
          className="dino"
          alt="dino"
          style={{ bottom: `${state.dino.bottom}%` }}
        />

        {/* Cacti */}
        {state.cacti.map((cactus) => (
          <img
            key={cactus.id}
            src={cactusImg}
            className="cactus"
            alt="cactus"
            style={{ left: `${cactus.left}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default DinoGame;