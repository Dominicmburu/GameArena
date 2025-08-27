import React, { useState } from 'react'
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Tab, Tabs } from 'react-bootstrap'
import { Target, TrendingUp, Award, Clock, Zap, Brain, Gamepad2, BarChart3 } from 'lucide-react'

const TrainPage = () => {
  const [activeTab, setActiveTab] = useState('practice')

  // Mock training data
  const trainingGames = [
    {
      id: 1,
      name: "Aim Trainer",
      description: "Improve your accuracy and reaction time",
      category: "Accuracy",
      icon: "🎯",
      difficulty: "Adjustable",
      sessions: 45,
      bestScore: 2450,
      avgScore: 1850,
      improvement: "+12%",
      lastPlayed: "2 hours ago",
      color: "#00F0FF"
    },
    {
      id: 2,
      name: "Speed Clicker",
      description: "Enhance your clicking speed and precision",
      category: "Speed",
      icon: "⚡",
      difficulty: "Progressive",
      sessions: 32,
      bestScore: 180,
      avgScore: 145,
      improvement: "+8%",
      lastPlayed: "1 day ago",
      color: "#9B00FF"
    },
    {
      id: 3,
      name: "Memory Palace",
      description: "Train your memory with pattern recognition",
      category: "Memory",
      icon: "🧠",
      difficulty: "Advanced",
      sessions: 28,
      bestScore: 3200,
      avgScore: 2650,
      improvement: "+15%",
      lastPlayed: "3 hours ago",
      color: "#00FF85"
    },
    {
      id: 4,
      name: "Strategy Simulator",
      description: "Practice strategic thinking and planning",
      category: "Strategy",
      icon: "♟️",
      difficulty: "Expert",
      sessions: 18,
      bestScore: 1890,
      avgScore: 1420,
      improvement: "+6%",
      lastPlayed: "5 hours ago",
      color: "#FF003C"
    },
    {
      id: 5,
      name: "Reflex Master",
      description: "Sharpen your reflexes and reaction times",
      category: "Reflexes",
      icon: "⚡",
      difficulty: "Dynamic",
      sessions: 52,
      bestScore: 98,
      avgScore: 78,
      improvement: "+18%",
      lastPlayed: "30 min ago",
      color: "#00F0FF"
    },
    {
      id: 6,
      name: "Puzzle Solver",
      description: "Challenge your problem-solving abilities",
      category: "Logic",
      icon: "🧩",
      difficulty: "Variable",
      sessions: 34,
      bestScore: 4250,
      avgScore: 3100,
      improvement: "+22%",
      lastPlayed: "6 hours ago",
      color: "#9B00FF"
    }
  ]

  // Mock recent training sessions
  const recentSessions = [
    { game: "Aim Trainer", score: 2450, improvement: "+5%", date: "2 hours ago", duration: "15 min" },
    { game: "Memory Palace", score: 3200, improvement: "+12%", date: "3 hours ago", duration: "20 min" },
    { game: "Reflex Master", score: 98, improvement: "+3%", date: "30 min ago", duration: "10 min" },
    { game: "Puzzle Solver", score: 4100, improvement: "+8%", date: "1 day ago", duration: "25 min" },
    { game: "Speed Clicker", score: 175, improvement: "+2%", date: "1 day ago", duration: "12 min" }
  ]

  // Mock achievements
  const achievements = [
    { 
      id: 1, 
      title: "Sharpshooter", 
      description: "Score 2000+ in Aim Trainer", 
      icon: "🏹", 
      unlocked: true,
      rarity: "Rare"
    },
    { 
      id: 2, 
      title: "Memory Master", 
      description: "Complete 50 Memory Palace sessions", 
      icon: "🎓", 
      unlocked: true,
      rarity: "Epic"
    },
    { 
      id: 3, 
      title: "Lightning Fast", 
      description: "Achieve 100+ clicks per second", 
      icon: "⚡", 
      unlocked: false,
      rarity: "Legendary",
      progress: 87
    },
    { 
      id: 4, 
      title: "Strategic Mind", 
      description: "Win 10 strategy simulations in a row", 
      icon: "🧠", 
      unlocked: false,
      rarity: "Epic",
      progress: 60
    }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return '#B0B0B0'
      case 'Rare': return '#00F0FF'
      case 'Epic': return '#9B00FF'
      case 'Legendary': return '#FF003C'
      default: return '#B0B0B0'
    }
  }

  return (
    <div className="trainpage animated-bg">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 className="cyber-text text-neon mb-2">
                    <Target size={32} className="me-3" />
                    Training Arena
                  </h1>
                  <p className="text-white mb-0">Sharpen your skills and dominate the competition</p>
                </div>
                <div className="training-stats d-flex gap-3 flex-wrap">
                  <div className="stat-item text-center">
                    <div className="stat-value text-neon fw-bold h4">209</div>
                    <div className="stat-label text-white small">Sessions</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-purple fw-bold h4">47h</div>
                    <div className="stat-label text-white small">Training Time</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-energy-green fw-bold h4">+14%</div>
                    <div className="stat-label text-white small">Avg Improvement</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Main Content */}
          <Col lg={8}>
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="cyber-tabs mb-4"
            >
              <Tab eventKey="practice" title="Practice Games">
                <Row>
                  {trainingGames.map(game => (
                    <Col lg={6} key={game.id} className="mb-4">
                      <Card className="cyber-card h-100 training-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div 
                                className="game-icon me-3"
                                style={{
                                  fontSize: '2.5rem',
                                  width: '60px',
                                  height: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: `linear-gradient(45deg, ${game.color}, rgba(155, 0, 255, 0.3))`,
                                  borderRadius: '12px'
                                }}
                              >
                                {game.icon}
                              </div>
                              <div>
                                <h5 className="text-white mb-1">{game.name}</h5>
                                <Badge style={{ background: game.color, color: '#0E0E10' }}>
                                  {game.category}
                                </Badge>
                              </div>
                            </div>
                            <div 
                              className="improvement-badge"
                              style={{
                                background: 'rgba(0, 255, 133, 0.2)',
                                border: '1px solid #00FF85',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                color: '#00FF85',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {game.improvement}
                            </div>
                          </div>

                          <p className="text-white mb-3">{game.description}</p>

                          <div className="training-stats mb-3">
                            <Row className="g-2">
                              <Col xs={6}>
                                <div className="stat-item">
                                  <small className="text-white">Best Score</small>
                                  <div className="stat-value text-neon fw-bold">{game.bestScore.toLocaleString()}</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="stat-item">
                                  <small className="text-white">Avg Score</small>
                                  <div className="stat-value text-purple fw-bold">{game.avgScore.toLocaleString()}</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="stat-item">
                                  <small className="text-white">Sessions</small>
                                  <div className="stat-value text-white fw-bold">{game.sessions}</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="stat-item">
                                  <small className="text-white">Last Played</small>
                                  <div className="stat-value text-silver-gray">{game.lastPlayed}</div>
                                </div>
                              </Col>
                            </Row>
                          </div>

                          <div className="d-flex gap-2">
                            <Button className="btn-cyber flex-fill">
                              <Target size={18} className="me-2" />
                              Start Training
                            </Button>
                            <Button className="btn-outline-cyber" style={{ minWidth: '50px' }}>
                              <BarChart3 size={18} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>

              <Tab eventKey="progress" title="Progress Tracking">
                <div className="progress-section">
                  {/* Recent Sessions */}
                  <Card className="cyber-card mb-4">
                    <Card.Header>
                      <h5 className="mb-0 d-flex align-items-center">
                        <Clock size={20} className="me-2 text-neon" />
                        Recent Training Sessions
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {recentSessions.map((session, index) => (
                        <div 
                          key={index}
                          className="session-item p-3 d-flex justify-content-between align-items-center"
                          style={{
                            borderBottom: index < recentSessions.length - 1 ? '1px solid rgba(0, 240, 255, 0.1)' : 'none'
                          }}
                        >
                          <div className="session-info">
                            <h6 className="text-white mb-1">{session.game}</h6>
                            <small className="text-white">{session.date} • {session.duration}</small>
                          </div>
                          <div className="session-stats text-end">
                            <div className="score text-neon fw-bold">{session.score.toLocaleString()}</div>
                            <div className="improvement text-energy-green small">{session.improvement}</div>
                          </div>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>

                  {/* Skills Progress */}
                  <Card className="cyber-card">
                    <Card.Header>
                      <h5 className="mb-0 d-flex align-items-center">
                        <TrendingUp size={20} className="me-2 text-purple" />
                        Skill Development
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6} className="mb-4">
                          <div className="skill-item">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-white">Accuracy</span>
                              <span className="text-neon fw-bold">87%</span>
                            </div>
                            <ProgressBar 
                              now={87} 
                              style={{ height: '8px' }}
                              className="skill-progress"
                            />
                          </div>
                        </Col>
                        <Col md={6} className="mb-4">
                          <div className="skill-item">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-white">Reaction Time</span>
                              <span className="text-purple fw-bold">92%</span>
                            </div>
                            <ProgressBar 
                              now={92} 
                              style={{ height: '8px' }}
                              className="skill-progress"
                            />
                          </div>
                        </Col>
                        <Col md={6} className="mb-4">
                          <div className="skill-item">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-white">Memory</span>
                              <span className="text-energy-green fw-bold">78%</span>
                            </div>
                            <ProgressBar 
                              now={78} 
                              style={{ height: '8px' }}
                              className="skill-progress"
                            />
                          </div>
                        </Col>
                        <Col md={6} className="mb-4">
                          <div className="skill-item">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-white">Strategy</span>
                              <span className="text-cyber-red fw-bold">65%</span>
                            </div>
                            <ProgressBar 
                              now={65} 
                              style={{ height: '8px' }}
                              className="skill-progress"
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              </Tab>

              <Tab eventKey="achievements" title="Achievements">
                <Row>
                  {achievements.map(achievement => (
                    <Col lg={6} key={achievement.id} className="mb-4">
                      <Card 
                        className={`cyber-card h-100 achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        style={{
                          opacity: achievement.unlocked ? 1 : 0.7,
                          border: `1px solid ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'rgba(176, 176, 176, 0.3)'}`
                        }}
                      >
                        <Card.Body className="text-center">
                          <div 
                            className="achievement-icon mb-3"
                            style={{
                              fontSize: '3rem',
                              filter: achievement.unlocked ? 'none' : 'grayscale(1)'
                            }}
                          >
                            {achievement.icon}
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="text-white mb-0">{achievement.title}</h5>
                            <Badge 
                              style={{ 
                                background: getRarityColor(achievement.rarity),
                                color: '#0E0E10'
                              }}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          
                          <p className="text-white mb-3">{achievement.description}</p>
                          
                          {achievement.unlocked ? (
                            <Badge 
                              className="w-100 py-2"
                              style={{ 
                                background: 'rgba(0, 255, 133, 0.2)',
                                border: '1px solid #00FF85',
                                color: '#00FF85'
                              }}
                            >
                              <Award size={16} className="me-2" />
                              UNLOCKED
                            </Badge>
                          ) : (
                            <div>
                              <div className="progress mb-2" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar"
                                  style={{
                                    width: `${achievement.progress}%`,
                                    background: `linear-gradient(90deg, ${getRarityColor(achievement.rarity)}, rgba(155, 0, 255, 0.5))`
                                  }}
                                />
                              </div>
                              <small className="text-white">{achievement.progress}% Complete</small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>
            </Tabs>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Daily Challenge */}
            <Card className="cyber-card mb-4">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <Zap size={20} color="#FF003C" className="me-2" />
                  <span className="fw-bold">Daily Challenge</span>
                </div>
                <Badge className="pulse" style={{ background: '#FF003C' }}>
                  NEW
                </Badge>
              </Card.Header>
              <Card.Body>
                <div className="challenge-content text-center">
                  <div className="challenge-icon mb-3" style={{ fontSize: '3rem' }}>
                    🎯
                  </div>
                  <h6 className="text-white mb-2">Precision Master</h6>
                  <p className="text-white mb-3">
                    Score 2500+ in Aim Trainer with 95% accuracy
                  </p>
                  <div className="challenge-reward mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white">Reward:</span>
                      <span className="text-energy-green fw-bold">500 XP + Badge</span>
                    </div>
                  </div>
                  <Button className="btn-cyber w-100">
                    Accept Challenge
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Training Streak */}
            <Card className="cyber-card mb-4">
              <Card.Header>
                <div className="d-flex align-items-center">
                  <Target size={20} color="#00FF85" className="me-2" />
                  <span className="fw-bold">Training Streak</span>
                </div>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="streak-display">
                  <div 
                    className="streak-number fw-bold display-4"
                    style={{
                      background: 'linear-gradient(45deg, #00FF85, #00F0FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    7
                  </div>
                  <div className="streak-label text-white mb-3">Days in a row</div>
                  
                  <div className="streak-calendar d-flex justify-content-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <div 
                        key={day}
                        className="day-indicator"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: day <= 7 ? '#00FF85' : 'rgba(176, 176, 176, 0.3)',
                          border: `1px solid ${day <= 7 ? '#00FF85' : '#B0B0B0'}`
                        }}
                      />
                    ))}
                  </div>
                  
                  <small className="text-white">
                    Keep it up! Next milestone at 14 days
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Card className="cyber-card">
              <Card.Header>
                <div className="d-flex align-items-center">
                  <Brain size={20} color="#9B00FF" className="me-2" />
                  <span className="fw-bold">Quick Stats</span>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="quick-stats">
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white">Total Training Time</span>
                    <span className="text-neon fw-bold">47h 23m</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white">Games Mastered</span>
                    <span className="text-purple fw-bold">4/6</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white">Achievements</span>
                    <span className="text-energy-green fw-bold">2/4</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white">Rank</span>
                    <span className="text-cyber-red fw-bold">Expert</span>
                  </div>
                  <div className="stat-row d-flex justify-content-between align-items-center">
                    <span className="text-white">Next Level</span>
                    <span className="text-white fw-bold">230 XP</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .training-card {
          transition: all 0.3s ease;
        }

        .training-card:hover {
          transform: translateY(-5px);
        }

        .stat-item {
          text-align: left;
        }

        .stat-value {
          font-size: 0.9rem;
        }

        .cyber-tabs .nav-link {
          background: transparent !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          color: #B0B0B0 !important;
          margin-right: 10px;
          border-radius: 20px !important;
          padding: 10px 20px !important;
          transition: all 0.3s ease;
        }

        .cyber-tabs .nav-link.active {
          background: rgba(0, 240, 255, 0.1) !important;
          color: #00F0FF !important;
          border-color: #00F0FF !important;
        }

        .cyber-tabs .nav-link:hover {
          color: #00F0FF !important;
          border-color: #00F0FF !important;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .session-item {
          transition: all 0.3s ease;
        }

        .session-item:hover {
          background: rgba(0, 240, 255, 0.05);
        }

        .skill-progress .progress-bar {
          background: linear-gradient(90deg, #00F0FF, #9B00FF) !important;
        }

        .achievement-card.locked {
          position: relative;
        }

        .achievement-card.locked::after {
          content: '🔒';
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 1.2rem;
          opacity: 0.7;
        }

        .day-indicator {
          transition: all 0.3s ease;
        }

        .day-indicator:hover {
          transform: scale(1.2);
        }

        .streak-calendar {
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}

export default TrainPage