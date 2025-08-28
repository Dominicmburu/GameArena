import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Modal, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { Play, Trophy, Clock, Users, Zap, TrendingUp, Medal, Target, Eye, UserPlus } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import PaymentModal from '../components/payment/PaymentModal';
import GamePlayground from '../components/gaming/GamePlayground';

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const {
    myCompetitions,
    participatedCompetitions,
    loading,
    errors,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    joinCompetition,
    getCompetitionByCode,
    markPlayerReady,
    clearErrors
  } = useGame();

  useEffect(() => {
    // Load user competitions on mount
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await Promise.all([
        fetchMyCompetitions(),
        fetchParticipatedCompetitions()
      ]);
      await loadWalletBalance();
      await loadLeaderboard();
    } catch (error) {
      console.error('Error loading user data:', error);
      showToastMessage('Error loading data', 'error');
    }
  };

  const loadWalletBalance = async () => {
    try {
      // You'll need to implement wallet service or add to context
      // For now, using placeholder
      setWalletBalance(100); // Placeholder
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // You'll need to implement leaderboard service
      // For now, using placeholder
      setLeaderboard([
        { rank: 1, username: 'PlayerOne', totalEarnings: 5000, avatar: '🏆', isUser: false },
        { rank: 2, username: 'GameMaster', totalEarnings: 4500, avatar: '👑', isUser: false },
        { rank: 3, username: 'CurrentUser', totalEarnings: 3200, avatar: '🎮', isUser: true },
        { rank: 4, username: 'Challenger', totalEarnings: 2800, avatar: '⚡', isUser: false },
        { rank: 5, username: 'ProGamer', totalEarnings: 2400, avatar: '🎯', isUser: false },
      ]);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleJoinCompetition = async () => {
    if (!joinCode.trim()) {
      showToastMessage('Please enter a competition code', 'error');
      return;
    }

    try {
      clearErrors('joiningCompetition');
      const result = await joinCompetition(joinCode.trim().toUpperCase());
      
      if (result.alreadyJoined) {
        showToastMessage('You are already in this competition', 'info');
      } else {
        showToastMessage('Successfully joined the competition!', 'success');
        // Reload competitions to show the newly joined one
        await loadUserData();
      }
      
      setShowJoinModal(false);
      setJoinCode('');
    } catch (error) {
      console.error('Error joining competition:', error);
      showToastMessage(error.message || 'Failed to join competition', 'error');
    }
  };

  const handlePlayClick = (competition) => {
    if (walletBalance >= competition.entryFee) {
      setSelectedCompetition(competition);
      setShowGameModal(true);
    } else {
      setSelectedCompetition(competition);
      setShowPaymentModal(true);
    }
  };

  const handleMarkReady = async (competitionCode) => {
    try {
      await markPlayerReady(competitionCode);
      showToastMessage('Marked as ready!', 'success');
      await loadUserData(); // Refresh competitions
    } catch (error) {
      console.error('Error marking ready:', error);
      showToastMessage(error.message || 'Failed to mark as ready', 'error');
    }
  };

  const handlePaymentSuccess = () => {
    loadWalletBalance();
    setShowPaymentModal(false);
    if (selectedCompetition) {
      setShowGameModal(true);
    }
  };

  const handleGameEnd = (gameResults) => {
    setShowGameModal(false);
    loadUserData();
    showToastMessage('Game completed successfully!', 'success');
  };

  const getRankColor = (rank) => {
    if (rank <= 5) return '#00FF85';
    if (rank <= 20) return '#00F0FF';
    if (rank <= 50) return '#9B00FF';
    return '#B0B0B0';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return '#00F0FF';
      case 'ONGOING': return '#00FF85';
      case 'COMPLETED': return '#B0B0B0';
      case 'CANCELED': return '#FF003C';
      default: return '#B0B0B0';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'UPCOMING': return 'UPCOMING';
      case 'ONGOING': return 'ONGOING';
      case 'COMPLETED': return 'COMPLETED';
      case 'CANCELED': return 'CANCELED';
      default: return status.toUpperCase();
    }
  };

  // Combine myCompetitions and participatedCompetitions for the active tab
  const activeCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING'),
    ...participatedCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING')
  ].filter((comp, index, self) => 
    index === self.findIndex(c => c.id === comp.id) // Remove duplicates
  );

  const completedCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED'),
    ...participatedCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED')
  ].filter((comp, index, self) => 
    index === self.findIndex(c => c.id === comp.id) // Remove duplicates
  );


  if (loading.myCompetitions || loading.participatedCompetitions) {
    return (
      <div className="playpage animated-bg">
        <Container fluid className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="text-white mt-3">Loading your competitions...</div>
            </div>
          </div>
        </Container>
      </div>
    );
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
                  {/* <div className="stat-item text-center">
                    <div className="stat-value text-neon fw-bold h4">
                      KSh {walletBalance} 
                    </div>
                    <div className="stat-label text-white small">Wallet Balance</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-purple fw-bold h4">
                      {activeCompetitions.length}
                    </div>
                    <div className="stat-label text-white small">Active</div>
                  </div>
                  <div className="stat-item text-center">
                    <div className="stat-value text-energy-green fw-bold h4">87%</div>
                    <div className="stat-label text-white small">Win Rate</div>
                  </div> */}
                  <Button 
                    className="btn-cyber ms-3"
                    onClick={() => setShowJoinModal(true)}
                  >
                    <UserPlus size={20} className="me-2" />
                    Join Competition
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Error Display */}
        {(errors.myCompetitions || errors.participatedCompetitions) && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger">
                {errors.myCompetitions || errors.participatedCompetitions}
              </Alert>
            </Col>
          </Row>
        )}

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
                  {activeCompetitions.length === 0 ? (
                    <Card className="cyber-card text-center py-5">
                      <Card.Body>
                        <Target size={48} className="text-grey mb-3" />
                        <h5 className="text-white mb-2">No Active Competitions</h5>
                        <p className="text-grey mb-3">Join a competition to start playing!</p>
                        <Button 
                          className="btn-cyber"
                          onClick={() => setShowJoinModal(true)}
                        >
                          <UserPlus size={20} className="me-2" />
                          Join Competition
                        </Button>
                      </Card.Body>
                    </Card>
                  ) : (
                    activeCompetitions.map(comp => (
                      <Card key={comp.id} className="cyber-card mb-3 competition-card">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col md={8}>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="text-white mb-1">{comp.title}</h5>
                                  <Badge className="me-2" style={{ background: '#9B00FF' }}>
                                    {comp.Game?.name || comp.gameName}
                                  </Badge>
                                  <Badge style={{ background: getStatusColor(comp.status) }}>
                                    {getStatusText(comp.status)}
                                  </Badge>
                                </div>
                                <div className="rank-display text-center">
                                  <div className="rank-number fw-bold h3 text-neon">
                                    #{comp.currentRank || '0'}
                                  </div>
                                  <small className="text-white">of {comp.currentPlayers || comp.maxPlayers}</small>
                                </div>
                              </div>

                              <div className="competition-stats mb-3">
                                <Row className="g-2">
                                  <Col sm={4}>
                                    <div className="stat-item">
                                      <Trophy size={16} color="#00F0FF" className="me-2" />
                                      <span className="text-neon">KSh {comp.totalPrizePool || (comp.entryFee * comp.maxPlayers * 0.9)}</span>
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
                                      <span className="text-purple">{comp.currentPlayers || comp.participants?.length || 0}/{comp.maxPlayers}</span>
                                    </div>
                                  </Col>
                                </Row>
                              </div>
                            </Col>

                            <Col md={4} className="text-end">
                              {comp.status === 'UPCOMING' && (
                                <Button 
                                  className="btn-outline-cyber w-100 mb-2"
                                  size="sm"
                                  onClick={() => handleMarkReady(comp.code)}
                                >
                                  Mark Ready
                                </Button>
                              )}
                              <Button 
                                className="btn-cyber w-100 mb-2"
                                size="lg"
                                onClick={() => handlePlayClick(comp)}
                                disabled={comp.status === 'UPCOMING'}
                              >
                                <Play size={20} className="me-2" />
                                {comp.status === 'UPCOMING' ? 'Starts Soon' : 'Play Now'}
                              </Button>
                              <Button 
                                className="btn-outline-cyber w-100"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompetition(comp);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <Eye size={18} className="me-2" />
                                View Details
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              </Tab>

              <Tab eventKey="completed" title="Completed">
                <div className="competitions-list">
                  {completedCompetitions.length === 0 ? (
                    <Card className="cyber-card text-center py-5">
                      <Card.Body>
                        <Medal size={48} className="text-grey mb-3" />
                        <h5 className="text-white mb-2">No Completed Competitions</h5>
                        <p className="text-grey">Complete some competitions to see your history here!</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    completedCompetitions.map(comp => (
                      <Card key={comp.id} className="cyber-card mb-3 competition-card">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col md={8}>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="text-white mb-1">{comp.title}</h5>
                                  <Badge className="me-2" style={{ background: '#9B00FF' }}>
                                    {comp.Game?.name || comp.gameName}
                                  </Badge>
                                  <Badge style={{ background: getStatusColor(comp.status) }}>
                                    {getStatusText(comp.status)}
                                  </Badge>
                                </div>
                                <div className="rank-display text-center">
                                  <div className="rank-number fw-bold h3" style={{ color: getRankColor(comp.finalRank) }}>
                                    #{comp.finalRank || '0'}
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
                                      <span className="text-purple">{comp.totalPlayers || comp.maxPlayers} players</span>
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
                                  setSelectedCompetition(comp);
                                  setShowDetailsModal(true);
                                }}
                              >
                                View Results
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  )}
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

      {/* Join Competition Modal */}
      <Modal 
        show={showJoinModal} 
        onHide={() => setShowJoinModal(false)}
        className="cyber-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <UserPlus size={24} className="me-2 text-neon" />
            Join Competition
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="joinCode" className="form-label text-white">Competition Code</label>
            <input
              type="text"
              className="form-control cyber-input"
              id="joinCode"
              placeholder="Enter competition code (e.g., ABC123)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <small className="text-grey">Enter the 6-8 character competition code</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowJoinModal(false)}>
            Cancel
          </Button>
          <Button 
            className="btn-cyber"
            onClick={handleJoinCompetition}
            disabled={!joinCode.trim()}
          >
            <UserPlus size={18} className="me-2" />
            Join Competition
          </Button>
        </Modal.Footer>
      </Modal>

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
        // size="lg"
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
                <Col md={12}>
                  <div className="competition-info">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Badge style={{ background: getStatusColor(selectedCompetition.status), color: '#0E0E10', padding: '6px 12px' }}>
                        {getStatusText(selectedCompetition.status)}
                      </Badge>
                      <Badge style={{ background: '#9B00FF', padding: '6px 12px' }}>
                        {selectedCompetition.Game?.name || selectedCompetition.gameName}
                      </Badge>
                      <Badge style={{ background: '#00F0FF', color: '#0E0E10', padding: '6px 12px' }}>
                        {selectedCompetition.gameLevel?.toUpperCase() || 'BEGINNER'}
                      </Badge>
                    </div>
                    
                    {/* competition code */}
                    <p className="text-white mb-3">{selectedCompetition.code}</p>
                    
                    <div className="competition-meta">
                      <Row>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Duration:</strong>
                          <div className="text-white">{selectedCompetition.minutesToPlay} minutes</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Players:</strong>
                          <div className="text-white">{selectedCompetition.currentPlayers || 0}/{selectedCompetition.maxPlayers}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Entry Fee:</strong>
                          <div className="text-white">KSh {selectedCompetition.entryFee}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Total Prize:</strong>
                          <div className="text-energy-green fw-bold">KSh {selectedCompetition.totalPrizePool || (selectedCompetition.entryFee * selectedCompetition.maxPlayers * 0.9)}</div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
                
                {/* <Col md={4}>
                  <div className="competition-stats cyber-card p-3">
                    <h6 className="text-neon mb-3">Prize Distribution</h6>
                    <div className="prize-breakdown">
                      {(() => {
                        const totalPrize = selectedCompetition.totalPrizePool || (selectedCompetition.entryFee * selectedCompetition.maxPlayers * 0.9);
                        return (
                          <>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-white">🥇 1st Place:</span>
                              <span className="text-energy-green fw-bold">
                                KSh {(totalPrize * 0.6).toFixed(2)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-white">🥈 2nd Place:</span>
                              <span className="text-neon fw-bold">
                                KSh {(totalPrize * 0.25).toFixed(2)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-white">🥉 3rd Place:</span>
                              <span className="text-purple fw-bold">
                                KSh {(totalPrize * 0.15).toFixed(2)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </Col> */}
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
          {selectedCompetition?.status === 'ONGOING' && (
            <Button 
              className="btn-cyber"
              onClick={() => {
                setShowDetailsModal(false);
                handlePlayClick(selectedCompetition);
              }}
            >
              <Play size={18} className="me-2" />
              Join & Play
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          className={`cyber-toast ${toastVariant}`}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === 'success' ? 'Success' : toastVariant === 'error' ? 'Error' : 'Info'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

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

        .cyber-input {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          color: #fff !important;
          border-radius: 8px !important;
        }

        .cyber-input:focus {
          background: rgba(0, 0, 0, 0.5) !important;
          border-color: #00F0FF !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 240, 255, 0.25) !important;
          color: #fff !important;
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

        .cyber-toast.success .toast-header {
          background: rgba(0, 255, 133, 0.1);
          color: #00FF85;
        }

        .cyber-toast.error .toast-header {
          background: rgba(255, 0, 60, 0.1);
          color: #FF003C;
        }

        .cyber-toast.info .toast-header {
          background: rgba(0, 240, 255, 0.1);
          color: #00F0FF;
        }

        .cyber-toast {
          background: rgba(14, 14, 16, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default PlayPage;