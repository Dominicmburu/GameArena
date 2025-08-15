import React, { useState } from 'react'
import { Container, Row, Col, Card, Badge, Button, Table, Tab, Tabs } from 'react-bootstrap'
import { Play, Trophy, Clock, Users, Zap, TrendingUp, Medal, Target } from 'lucide-react'

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('active')

  // Mock data for user's competitions
  const myCompetitions = [
    {
      id: 1,
      title: "Cyber Clash Championship",
      game: "Battle Royale",
      currentRank: 23,
      totalPlayers: 2847,
      timeLeft: "2h 45m",
      status: "active",
      score: 15420,
      nextReward: 500,
      progress: 78
    },
    {
      id: 2,
      title: "Brain Hack Tournament",
      game: "Puzzle",
      currentRank: 7,
      totalPlayers: 892,
      timeLeft: "4d 12h",
      status: "active",
      score: 28950,
      nextReward: 1200,
      progress: 92
    },
    {
      id: 3,
      title: "Speed Run Masters",
      game: "Racing",
      currentRank: 156,
      totalPlayers: 1500,
      timeLeft: "Ended",
      status: "completed",
      score: 8450,
      finalReward: 50,
      progress: 100
    }
  ]

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, player: "CyberNinja_X", score: 45250, avatar: "🥇" },
    { rank: 2, player: "QuantumGamer", score: 42180, avatar: "🥈" },
    { rank: 3, player: "NeonStrike", score: 38920, avatar: "🥉" },
    { rank: 4, player: "PixelWarrior", score: 35640, avatar: "👾" },
    { rank: 5, player: "DataHunter", score: 33210, avatar: "🎯" },
    { rank: 6, player: "You", score: 28950, avatar: "🎮", isUser: true },
    { rank: 7, player: "CodeBreaker", score: 27180, avatar: "💻" },
    { rank: 8, player: "EliteGamer", score: 25960, avatar: "⚡" }
  ]

  const getRankColor = (rank) => {
    if (rank <= 5) return '#00FF85'
    if (rank <= 20) return '#00F0FF'
    if (rank <= 50) return '#9B00FF'
    return '#B0B0B0'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00FF85'
      case 'completed': return '#B0B0B0'
      case 'upcoming': return '#00F0FF'
      default: return '#B0B0B0'
    }
  }

  return (
    <div className="playpage animated-bg">
      <Container fluid className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 className="cyber-text text-neon mb-2">
                    <Play size={32} className="me-3" />
                    Your Gaming Arena
                  </h1>
                  <p className="text-muted mb-0">Track your progress and dominate the leaderboards</p>
                </div>
                <div className="player-stats d-flex gap-3 flex-wrap">
                  <div className="stat-item text-center">
                    <div className="stat-value text-neon fw-bold h4">3</div>
                    <div className="stat-label text-muted small">Active</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-purple fw-bold h4">12</div>
                    <div className="stat-label text-muted small">Completed</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-energy-green fw-bold h4">87%</div>
                    <div className="stat-label text-muted small">Win Rate</div>
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
              <Tab eventKey="active" title="Active Competitions">
                <div className="competitions-list">
                  {myCompetitions.filter(comp => comp.status === 'active').map(comp => (
                    <Card key={comp.id} className="cyber-card mb-3 competition-card">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={8}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="text-white mb-1">{comp.title}</h5>
                                <Badge className="me-2" style={{ background: '#9B00FF' }}>
                                  {comp.game}
                                </Badge>
                                <Badge style={{ background: getStatusColor(comp.status) }}>
                                  {comp.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="rank-display text-center">
                                <div 
                                  className="rank-number fw-bold h3"
                                  style={{ color: getRankColor(comp.currentRank) }}
                                >
                                  #{comp.currentRank}
                                </div>
                                <small className="text-muted">of {comp.totalPlayers}</small>
                              </div>
                            </div>

                            <div className="competition-stats mb-3">
                              <Row className="g-2">
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Trophy size={16} color="#00F0FF" className="me-2" />
                                    <span className="text-neon">{comp.score.toLocaleString()}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Clock size={16} color="#FF003C" className="me-2" />
                                    <span className="text-cyber-red">{comp.timeLeft}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Target size={16} color="#00FF85" className="me-2" />
                                    <span className="text-energy-green">+{comp.nextReward}</span>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            <div className="progress mb-2" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar"
                                style={{
                                  width: `${comp.progress}%`,
                                  background: `linear-gradient(90deg, ${getRankColor(comp.currentRank)}, #9B00FF)`
                                }}
                              />
                            </div>
                            <small className="text-muted">Progress: {comp.progress}%</small>
                          </Col>

                          <Col md={4} className="text-end">
                            <Button 
                              className="btn-cyber w-100 mb-2"
                              size="lg"
                            >
                              <Play size={20} className="me-2" />
                              Play Now
                            </Button>
                            <Button 
                              className="btn-outline-cyber w-100"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Tab>

              <Tab eventKey="completed" title="Completed">
                <div className="competitions-list">
                  {myCompetitions.filter(comp => comp.status === 'completed').map(comp => (
                    <Card key={comp.id} className="cyber-card mb-3 competition-card">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={8}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="text-white mb-1">{comp.title}</h5>
                                <Badge className="me-2" style={{ background: '#9B00FF' }}>
                                  {comp.game}
                                </Badge>
                                <Badge style={{ background: getStatusColor(comp.status) }}>
                                  COMPLETED
                                </Badge>
                              </div>
                              <div className="rank-display text-center">
                                <div 
                                  className="rank-number fw-bold h3"
                                  style={{ color: getRankColor(comp.currentRank) }}
                                >
                                  #{comp.currentRank}
                                </div>
                                <small className="text-muted">Final Rank</small>
                              </div>
                            </div>

                            <div className="competition-stats">
                              <Row className="g-2">
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Trophy size={16} color="#00F0FF" className="me-2" />
                                    <span className="text-neon">{comp.score.toLocaleString()}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Medal size={16} color="#00FF85" className="me-2" />
                                    <span className="text-energy-green">${comp.finalReward}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Users size={16} color="#9B00FF" className="me-2" />
                                    <span className="text-purple">{comp.totalPlayers} players</span>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </Col>

                          <Col md={4} className="text-end">
                            <Button 
                              className="btn-outline-cyber w-100 mb-2"
                              size="sm"
                            >
                              View Results
                            </Button>
                            <Button 
                              className="btn-outline-cyber w-100"
                              size="sm"
                            >
                              Play Again
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Tab>
            </Tabs>
          </Col>

          {/* Sidebar - Live Leaderboard */}
          <Col lg={4}>
            <Card className="cyber-card sticky-top" style={{ top: '100px' }}>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <TrendingUp size={20} color="#00F0FF" className="me-2" />
                  <span className="fw-bold">Live Leaderboard</span>
                </div>
                <Badge className="pulse" style={{ background: '#00FF85' }}>
                  LIVE
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="leaderboard-list">
                  {leaderboard.map((player, index) => (
                    <div 
                      key={index}
                      className={`leaderboard-item p-3 d-flex align-items-center ${player.isUser ? 'user-row' : ''}`}
                      style={{
                        borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
                        background: player.isUser ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                      }}
                    >
                      <div 
                        className="rank-badge me-3"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: getRankColor(player.rank),
                          color: '#0E0E10',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {player.rank}
                      </div>
                      
                      <div className="player-avatar me-3" style={{ fontSize: '1.5rem' }}>
                        {player.avatar}
                      </div>
                      
                      <div className="player-info flex-grow-1">
                        <div className="player-name fw-bold text-white">
                          {player.player}
                          {player.isUser && <span className="text-neon ms-2">(You)</span>}
                        </div>
                        <div className="player-score text-muted small">
                          {player.score.toLocaleString()} points
                        </div>
                      </div>
                      
                      {player.rank <= 3 && (
                        <div className="trophy-icon">
                          <Trophy size={16} color={getRankColor(player.rank)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .competition-card {
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .competition-card:hover {
          transform: translateX(5px);
          border-left-color: #00F0FF;
        }

        .stat-item {
          display: flex;
          align-items: center;
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

        .leaderboard-item {
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover {
          background: rgba(0, 240, 255, 0.05) !important;
        }

        .user-row {
          position: relative;
        }

        .user-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(45deg, #00F0FF, #9B00FF);
        }
      `}</style>
    </div>
  )
}

export default PlayPage