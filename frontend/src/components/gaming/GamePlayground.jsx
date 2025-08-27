import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { Play, Pause, Square, Users, Trophy } from 'lucide-react';
import DinoGame from '../../games/dino/DinoGame';
import { competitionService } from '../../services/competitionService';
import websocketService from '../../services/websocketService';

const GamePlayground = ({ competition, onGameEnd }) => {
  const gameRef = useRef(null)
  const [gameState, setGameState] = useState('waiting')
  const [currentScore, setCurrentScore] = useState(0)
  const [liveLeaderboard, setLiveLeaderboard] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(competition.minutesToPlay * 60)
  const [connectedPlayers, setConnectedPlayers] = useState([])

  useEffect(() => {
    initializeGame()
    setupWebSocket()

    return () => {
      if (gameRef.current) {
        gameRef.current.endGame()
      }
      websocketService.removeAllListeners()
    }
  }, [])

  const initializeGame = () => {
    const gameConfig = {
      duration: competition.minutesToPlay,
      competitionId: competition.id,
      gameLevel: competition.gameLevel
    }

    const game = new DinoGame(gameConfig)
    gameRef.current = game

    // Game event listeners
    game.on('scoreUpdated', ({ detail }) => {
      const { score } = detail
      setCurrentScore(score)
      
      // Send score update to server and other players
      competitionService.updateScore(competition.id, score)
      websocketService.updateScore(competition.id, score)
    })

    game.on('gameEnded', ({ detail }) => {
      const { leaderboard, duration } = detail
      setGameState('finished')
      
      // Submit final results
      competitionService.submitResults(competition.id, {
        leaderboard,
        duration,
        endTime: Date.now()
      })
      
      websocketService.endGame(competition.id, currentScore, detail)
      onGameEnd(detail)
    })

    // Initialize the game
    game.initializeGame()
  }

  const setupWebSocket = () => {
    // Join competition room
    websocketService.joinCompetition(competition.id)

    // Listen for game events
    websocketService.on('gameStarted', ({ startTime }) => {
      setGameState('playing')
      if (gameRef.current) {
        gameRef.current.startGame()
      }
    })

    websocketService.on('playerJoined', ({ userId, username }) => {
      setConnectedPlayers(prev => [...prev, { userId, username }])
    })

    websocketService.on('playerLeft', ({ userId }) => {
      setConnectedPlayers(prev => prev.filter(p => p.userId !== userId))
    })

    websocketService.on('liveScoreUpdate', ({ userId, username, score }) => {
      setLiveLeaderboard(prev => {
        const updated = prev.filter(p => p.userId !== userId)
        updated.push({ userId, username, score })
        return updated.sort((a, b) => b.score - a.score)
      })
    })

    websocketService.on('playerFinished', ({ userId, username, finalScore }) => {
      // Update leaderboard with final score
      setLiveLeaderboard(prev => {
        const updated = prev.map(p => 
          p.userId === userId ? { ...p, score: finalScore, finished: true } : p
        )
        return updated.sort((a, b) => b.score - a.score)
      })
    })
  }

  const startGame = () => {
    if (gameRef.current && gameState === 'waiting') {
      websocketService.startGame(competition.id)
    }
  }

  const pauseGame = () => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.pauseGame()
      setGameState('paused')
    }
  }

  const resumeGame = () => {
    if (gameRef.current && gameState === 'paused') {
      gameRef.current.resumeGame()
      setGameState('playing')
    }
  }

  // Timer effect
  useEffect(() => {
    let interval
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (gameRef.current) {
              gameRef.current.endGame()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, timeRemaining])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Container fluid className="game-playground">
      <Row>
        {/* Game Area */}
        <Col lg={8}>
          <Card className="cyber-card mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{competition.title}</h5>
                <small className="text-muted">{competition.Game?.name}</small>
              </div>
              <div className="game-info d-flex gap-3">
                <Badge style={{ background: '#00F0FF' }}>
                  Score: {currentScore}
                </Badge>
                <Badge style={{ background: '#FF003C' }}>
                  Time: {formatTime(timeRemaining)}
                </Badge>
                <Badge style={{ background: '#00FF85' }}>
                  {gameState.toUpperCase()}
                </Badge>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              <div className="game-controls p-3 border-bottom">
                {gameState === 'waiting' && (
                  <Button className="btn-cyber me-2" onClick={startGame}>
                    <Play size={18} className="me-2" />
                    Start Game
                  </Button>
                )}
                
                {gameState === 'playing' && (
                  <Button className="btn-outline-cyber me-2" onClick={pauseGame}>
                    <Pause size={18} className="me-2" />
                    Pause
                  </Button>
                )}
                
                {gameState === 'paused' && (
                  <Button className="btn-cyber me-2" onClick={resumeGame}>
                    <Play size={18} className="me-2" />
                    Resume
                  </Button>
                )}

                <span className="text-white ms-3">
                  Players: {connectedPlayers.length}/{competition.maxPlayers}
                </span>
              </div>
              
              {/* Game Canvas */}
              <div className="game-canvas-container">
                <canvas 
                  id="gameCanvas" 
                  className="game-canvas"
                  style={{
                    width: '100%',
                    height: '400px',
                    background: '#f0f0f0',
                    border: '2px solid #00F0FF'
                  }}
                />
                
                {gameState === 'waiting' && (
                  <div className="game-overlay">
                    <div className="text-center">
                      <h4 className="text-white mb-3">Waiting for game to start...</h4>
                      <p className="text-white">
                        Press SPACE or tap to jump when the game begins!
                      </p>
                    </div>
                  </div>
                )}
                
                {gameState === 'finished' && (
                  <div className="game-overlay">
                    <div className="text-center">
                      <Trophy size={64} color="#00FF85" className="mb-3" />
                      <h4 className="text-white mb-2">Game Finished!</h4>
                      <h5 className="text-neon">Final Score: {currentScore}</h5>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Live Leaderboard & Players */}
        <Col lg={4}>
          <Card className="cyber-card mb-3">
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center">
                <Trophy size={20} className="me-2 text-neon" />
                Live Leaderboard
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="leaderboard-list">
                {liveLeaderboard.map((player, index) => (
                  <div 
                    key={player.userId}
                    className="leaderboard-item p-3 d-flex justify-content-between align-items-center"
                    style={{
                      borderBottom: index < liveLeaderboard.length - 1 ? '1px solid rgba(0, 240, 255, 0.1)' : 'none',
                      background: player.finished ? 'rgba(0, 255, 133, 0.1)' : 'transparent'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span 
                        className="rank-badge me-3"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: index === 0 ? '#00FF85' : index === 1 ? '#00F0FF' : '#9B00FF',
                          color: '#0E0E10',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-white fw-bold">{player.username}</div>
                        {player.finished && (
                          <small className="text-energy-green">Finished</small>
                        )}
                      </div>
                    </div>
                    <div className="text-neon fw-bold">
                      {player.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Connected Players */}
          <Card className="cyber-card">
            <Card.Header>
              <h6 className="mb-0 d-flex align-items-center">
                <Users size={20} className="me-2 text-purple" />
                Connected Players ({connectedPlayers.length})
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="players-list">
                {connectedPlayers.map((player, index) => (
                  <div 
                    key={player.userId}
                    className="player-item p-2 d-flex align-items-center"
                    style={{
                      borderBottom: index < connectedPlayers.length - 1 ? '1px solid rgba(0, 240, 255, 0.1)' : 'none'
                    }}
                  >
                    <div 
                      className="player-avatar me-2"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#9B00FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'white'
                      }}
                    >
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white">{player.username}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .game-canvas-container {
          position: relative;
          overflow: hidden;
        }

        .game-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .game-canvas {
          display: block;
          margin: 0 auto;
        }

        .leaderboard-item, .player-item {
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover, .player-item:hover {
          background: rgba(0, 240, 255, 0.05) !important;
        }
      `}</style>
    </Container>
  )
}

export default GamePlayground