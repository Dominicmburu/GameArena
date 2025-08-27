import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Modal } from 'react-bootstrap';
import { Play, Trophy, Clock, Users, Zap, TrendingUp, Medal, Target, Eye } from 'lucide-react';
import { competitionService } from '../services/competitionService';
import { paymentService } from '../services/paymentService';
import PaymentModal from '../components/payment/PaymentModal';
import GamePlayground from '../components/gaming/GamePlayground';

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('active')
  const [myCompetitions, setMyCompetitions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    loadUserCompetitions()
    loadWalletBalance()
  }, [])

  const loadUserCompetitions = async () => {
    try {
      setLoading(true)
      const response = await competitionService.getUserCompetitions()
      setMyCompetitions(response.data)
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWalletBalance = async () => {
    try {
      const response = await paymentService.getWalletBalance()
      setWalletBalance(response.data.balance)
    } catch (error) {
      console.error('Error loading wallet balance:', error)
    }
  }

  const handlePlayClick = (competition) => {
    if (walletBalance >= competition.entryFee) {
      setSelectedCompetition(competition)
      setShowGameModal(true)
    } else {
      setSelectedCompetition(competition)
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = () => {
    loadWalletBalance()
    setShowPaymentModal(false)
    if (selectedCompetition) {
      setShowGameModal(true)
    }
  }

  const handleGameEnd = (gameResults) => {
    setShowGameModal(false)
    loadUserCompetitions()
    // Show results or redirect to results page
  }

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
                  <p className="text-white mb-0">Track your progress and dominate the leaderboards</p>
                </div>
                <div className="player-stats d-flex gap-3 flex-wrap">
                  <div className="stat-item text-center">
                    <div className="stat-value text-neon fw-bold h4">
                      KSh {walletBalance.toFixed(2)}
                    </div>
                    <div className="stat-label text-white small">Wallet Balance</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-purple fw-bold h4">
                      {myCompetitions.filter(c => c.status === 'active').length}
                    </div>
                    <div className="stat-label text-white small">Active</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-energy-green fw-bold h4">87%</div>
                    <div className="stat-label text-white small">Win Rate</div>
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
                  {myCompetitions
                    .filter(comp => comp.status === 'ongoing' || comp.status === 'upcoming')
                    .map(comp => (
                    <Card key={comp.id} className="cyber-card mb-3 competition-card">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={8}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="text-white mb-1">{comp.title}</h5>
                                <Badge className="me-2" style={{ background: '#9B00FF' }}>
                                  {comp.Game?.name}
                                </Badge>
                                <Badge style={{ background: getStatusColor(comp.status) }}>
                                  {comp.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="rank-display text-center">
                                <div className="rank-number fw-bold h3 text-neon">
                                  #{comp.currentRank || 'N/A'}
                                </div>
                                <small className="text-white">of {comp.currentPlayers}</small>
                              </div>
                            </div>

                            <div className="competition-stats mb-3">
                              <Row className="g-2">
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Trophy size={16} color="#00F0FF" className="me-2" />
                                    <span className="text-neon">KSh {comp.totalPrizePool}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Clock size={16} color="#FF003C" className="me-2" />
                                    <span className="text-cyber-red">{comp.minutesToPlay}min</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Users size={16} color="#9B00FF" className="me-2" />
                                    <span className="text-purple">{comp.currentPlayers}/{comp.maxPlayers}</span>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </Col>

                          <Col md={4} className="text-end">
                            <Button 
                              className="btn-cyber w-100 mb-2"
                              size="lg"
                              onClick={() => handlePlayClick(comp)}
                              disabled={comp.status === 'upcoming'}
                            >
                              <Play size={20} className="me-2" />
                              {comp.status === 'upcoming' ? 'Starts Soon' : 'Play Now'}
                            </Button>
                            <Button 
                              className="btn-outline-cyber w-100"
                              size="sm"
                              onClick={() => {
                                setSelectedCompetition(comp)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye size={18} className="me-2" />
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
                                  {comp.Game?.name}
                                </Badge>
                                <Badge style={{ background: getStatusColor(comp.status) }}>
                                  COMPLETED
                                </Badge>
                              </div>
                              <div className="rank-display text-center">
                                <div className="rank-number fw-bold h3" style={{ color: getRankColor(comp.finalRank) }}>
                                  #{comp.finalRank}
                                </div>
                                <small className="text-white">Final Rank</small>
                              </div>
                            </div>

                            <div className="competition-stats">
                              <Row className="g-2">
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Trophy size={16} color="#00F0FF" className="me-2" />
                                    <span className="text-neon">{comp.finalScore?.toLocaleString() || 0}</span>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="stat-item">
                                    <Medal size={16} color="#00FF85" className="me-2" />
                                    <span className="text-energy-green">KSh {comp.earnings || 0}</span>
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
                              onClick={() => {
                                setSelectedCompetition(comp)
                                setShowDetailsModal(true)
                              }}
                            >
                              View Results
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
                  <span className="fw-bold">Global Leaderboard</span>
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
                        {player.avatar || '🎮'}
                      </div>
                      
                      <div className="player-info flex-grow-1">
                        <div className="player-name fw-bold text-white">
                          {player.username}
                          {player.isUser && <span className="text-neon ms-2">(You)</span>}
                        </div>
                        <div className="player-score text-grey small">
                          {player.totalEarnings?.toLocaleString() || 0} KSh earned
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

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        amount={selectedCompetition?.entryFee || 0}
        onSuccess={handlePaymentSuccess}
        title={`Join ${selectedCompetition?.title}`}
      />

      {/* Game Modal */}
      <Modal 
        show={showGameModal} 
        onHide={() => setShowGameModal(false)}
        size="xl"
        fullscreen="lg-down"
        className="cyber-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCompetition?.title} - Game Arena
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedCompetition && (
            <GamePlayground 
              competition={selectedCompetition}
              onGameEnd={handleGameEnd}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Competition Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        className="cyber-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Trophy size={24} className="me-2 text-neon" />
            {selectedCompetition?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCompetition && (
            <div className="competition-details">
              <Row className="mb-4">
                <Col md={8}>
                  <div className="competition-info">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Badge style={{ background: getStatusColor(selectedCompetition.status), color: '#0E0E10', padding: '6px 12px' }}>
                        {selectedCompetition.status.toUpperCase()}
                      </Badge>
                      <Badge style={{ background: '#9B00FF', padding: '6px 12px' }}>
                        {selectedCompetition.Game?.name}
                      </Badge>
                      <Badge style={{ background: '#00F0FF', color: '#0E0E10', padding: '6px 12px' }}>
                        {selectedCompetition.gameLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-white mb-3">{selectedCompetition.description}</p>
                    
                    <div className="competition-meta">
                      <Row>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Duration:</strong>
                          <div className="text-white">{selectedCompetition.minutesToPlay} minutes</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Players:</strong>
                          <div className="text-white">{selectedCompetition.currentPlayers}/{selectedCompetition.maxPlayers}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Entry Fee:</strong>
                          <div className="text-white">KSh {selectedCompetition.entryFee}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Total Prize:</strong>
                          <div className="text-energy-green fw-bold">KSh {selectedCompetition.totalPrizePool}</div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="competition-stats cyber-card p-3">
                    <h6 className="text-neon mb-3">Prize Distribution</h6>
                    <div className="prize-breakdown">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-white">🥇 1st Place:</span>
                        <span className="text-energy-green fw-bold">
                          KSh {(selectedCompetition.totalPrizePool * 0.6).toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-white">🥈 2nd Place:</span>
                        <span className="text-neon fw-bold">
                          KSh {(selectedCompetition.totalPrizePool * 0.25).toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-white">🥉 3rd Place:</span>
                        <span className="text-purple fw-bold">
                          KSh {(selectedCompetition.totalPrizePool * 0.15).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
          {selectedCompetition?.status === 'ongoing' && (
            <Button 
              className="btn-cyber"
              onClick={() => {
                setShowDetailsModal(false)
                handlePlayClick(selectedCompetition)
              }}
            >
              <Play size={18} className="me-2" />
              Join & Play
            </Button>
          )}
        </Modal.Footer>
      </Modal>

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

        .prize-breakdown {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}

export default PlayPage