import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Modal, Alert, Toast, ToastContainer, Form, ListGroup, Spinner } from 'react-bootstrap';
import { Play, Trophy, Clock, Users, Zap, TrendingUp, Medal, Target, UserPlus, Copy, Check, Send, UserCheck, UserX, MessageCircle, GamepadIcon, Search, History, Bell, Mail, X } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';
import PaymentModal from '../components/payment/PaymentModal';
import DinoGame from '../games/dino/DinoGame';

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInvitesModal, setShowInvitesModal] = useState(false);

  const { socket, connected, error: socketError, emit, subscribe } = useSocket();

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [friendRequestUsername, setFriendRequestUsername] = useState('');

  // Data states
  const [walletBalance, setWalletBalance] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // UI states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [copiedCode, setCopiedCode] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const [notifications, setNotifications] = useState([]);

  const {
    myCompetitions,
    participatedCompetitions,
    friends,
    friendRequests,
    gameHistory,
    pendingInvites,
    sentInvites,
    loading,
    errors,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
    joinCompetitionByCode,
    invitePlayerByUsername,
    acceptInvite,
    declineInvite,
    createCompetition,
    submitScore,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    clearErrors
  } = useGame();

  useEffect(() => {
    loadUserData();
  }, []);

  // Setup Socket.IO for real-time notifications
  useEffect(() => {

    if (!socket || !connected) return;

    console.log('Setting up socket event listeners...');

    // const socket = window.io?.();

    // Set up all event listeners
    const unsubscribers = [
      subscribe('new_invite', handleNewInvite),
      subscribe('invite_accepted', handleInviteAccepted),
      subscribe('invite_declined', handleInviteDeclined),
      subscribe('new_friend_request', handleNewFriendRequest),
      subscribe('friend_request_accepted', handleFriendRequestAccepted),
      subscribe('competition_joined', handleCompetitionJoined),
      subscribe('score_submitted', handleScoreSubmitted),
      subscribe('leaderboard:update', handleLeaderboardUpdate),
      subscribe('subscribed', (data) => {
        console.log('Successfully subscribed to:', data.competition);
      }),
      subscribe('error', (error) => {
        console.error('Socket error:', error);
        addNotification(error.message || 'Socket error occurred', 'error');
      })
    ];

    // Subscribe to active competitions for real-time updates
    if (myCompetitions && myCompetitions.length > 0) {
      myCompetitions
        .filter(comp => comp.status === 'ONGOING' || comp.status === 'UPCOMING')
        .forEach(comp => {
          emit('subscribe:competition', comp.code);
        });
    }

    if (participatedCompetitions && participatedCompetitions.length > 0) {
      participatedCompetitions
        .filter(comp => comp.status === 'ONGOING' || comp.status === 'UPCOMING')
        .forEach(comp => {
          emit('subscribe:competition', comp.code);
        });
    }

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [socket, connected, myCompetitions, participatedCompetitions]);

  // Show socket connection status
  useEffect(() => {
    if (socketError) {
      addNotification(`Connection error: ${socketError}`, 'error');
    } else if (connected) {
      console.log('Socket connected successfully');
    }
  }, [connected, socketError]);

  // Socket event handlers
  const handleNewInvite = (data) => {
    addNotification(`New invitation from ${data.invite.inviter.username}`, 'info');
    fetchPendingInvites().catch(console.warn);
  };

  const handleInviteAccepted = (data) => {
    addNotification(`${data.acceptedBy.username} accepted your invitation!`, 'success');
    fetchSentInvites().catch(console.warn);
    loadUserData().catch(console.warn);
  };

  const handleInviteDeclined = (data) => {
    addNotification(`${data.decliner} declined your invitation`, 'warning');
    fetchSentInvites().catch(console.warn);
  };

  const handleNewFriendRequest = (data) => {
    addNotification(`Friend request from ${data.request.from.username}`, 'info');
    fetchFriendRequests().catch(console.warn);
  };

  const handleFriendRequestAccepted = (data) => {
    addNotification(`${data.acceptedBy.username} accepted your friend request!`, 'success');
    fetchFriends().catch(console.warn);
  };

  const handleCompetitionJoined = (data) => {
    addNotification(`${data.player} joined your competition "${data.competitionTitle}"`, 'info');
    loadUserData().catch(console.warn);
  };

  const handleScoreSubmitted = (data) => {
    addNotification(`${data.player} submitted a score of ${data.score} in "${data.competitionTitle}"`, 'info');
  };

  const handleLeaderboardUpdate = (data) => {
    // Update leaderboard in real-time if needed
    console.log('Leaderboard updated:', data);
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loadUserData = async () => {
    try {
      await Promise.all([
        fetchMyCompetitions(),
        fetchParticipatedCompetitions(),
        loadWalletBalance(),
        loadGlobalLeaderboard(),
        fetchFriends(),
        fetchFriendRequests(),
        fetchGameHistory(),
        fetchPendingInvites(),
        fetchSentInvites()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToastMessage('Error loading data', 'error');
    }
  };

  const loadWalletBalance = async () => {
    try {
      // Temporary placeholder - implement actual wallet API call
      setWalletBalance(1500);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const loadGlobalLeaderboard = async () => {
    try {
      const leaderboardData = await fetchGlobalLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      showToastMessage('Please enter a competition code', 'error');
      return;
    }

    try {
      setLoading('joiningByCode', true);
      const result = await joinCompetitionByCode(joinCode.trim().toUpperCase());

      if (result.alreadyJoined) {
        showToastMessage('You are already in this competition', 'info');
      } else {
        showToastMessage('Successfully joined the competition!', 'success');
        await loadUserData();
      }

      setShowJoinModal(false);
      setJoinCode('');
    } catch (error) {
      console.error('Error joining competition:', error);
      showToastMessage(error.message || 'Failed to join competition', 'error');
    } finally {
      setLoading('joiningByCode', false);
    }
  };

  const handleInvitePlayer = async () => {
    if (!inviteUsername.trim()) {
      showToastMessage('Please enter a username', 'error');
      return;
    }

    if (!selectedCompetition) {
      showToastMessage('Please select a competition first', 'error');
      return;
    }

    try {
      setLoading('invitingPlayer', true);
      await invitePlayerByUsername({
        competitionId: selectedCompetition.id,
        username: inviteUsername.trim()
      });

      showToastMessage(`Invitation sent to ${inviteUsername}!`, 'success');
      setShowInviteModal(false);
      setInviteUsername('');
      setSelectedCompetition(null);
      fetchSentInvites(); // Refresh sent invites
    } catch (error) {
      console.error('Error inviting player:', error);
      showToastMessage(error.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading('invitingPlayer', false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      setLoading(`acceptingInvite_${inviteId}`, true);
      await acceptInvite(inviteId);
      showToastMessage('Invitation accepted!', 'success');
      await loadUserData();
    } catch (error) {
      console.error('Error accepting invite:', error);
      showToastMessage(error.message || 'Failed to accept invitation', 'error');
    } finally {
      setLoading(`acceptingInvite_${inviteId}`, false);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      setLoading(`decliningInvite_${inviteId}`, true);
      await declineInvite(inviteId);
      showToastMessage('Invitation declined', 'info');
      await fetchPendingInvites();
    } catch (error) {
      console.error('Error declining invite:', error);
      showToastMessage(error.message || 'Failed to decline invitation', 'error');
    } finally {
      setLoading(`decliningInvite_${inviteId}`, false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendRequestUsername.trim()) {
      showToastMessage('Please enter a username', 'error');
      return;
    }

    try {
      setLoading('sendingFriendRequest', true);
      await sendFriendRequest({ username: friendRequestUsername.trim() });
      showToastMessage(`Friend request sent to ${friendRequestUsername}!`, 'success');
      setFriendRequestUsername('');
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToastMessage(error.message || 'Failed to send friend request', 'error');
    } finally {
      setLoading('sendingFriendRequest', false);
    }
  };


  const handleAcceptFriendRequest = async (requestId) => {
    try {
      setLoading(`acceptingRequest_${requestId}`, true);
      await acceptFriendRequest(requestId);
      showToastMessage('Friend request accepted!', 'success');
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showToastMessage('Failed to accept friend request', 'error');
    } finally {
      setLoading(`acceptingRequest_${requestId}`, false);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      setLoading(`decliningRequest_${requestId}`, true);
      await declineFriendRequest(requestId);
      showToastMessage('Friend request declined', 'info');
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
      showToastMessage('Failed to decline friend request', 'error');
    } finally {
      setLoading(`decliningRequest_${requestId}`, false);
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

  const handleGameEnd = async (gameResults) => {
    try {
      if (selectedCompetition && gameResults) {
        await submitScore({
          competitionCode: selectedCompetition.code,
          score: gameResults.score,
          playTime: gameResults.playTime
        });

        showToastMessage(`Game completed! Score: ${gameResults.score}`, 'success');
        await loadUserData();
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      showToastMessage('Failed to submit score', 'error');
    } finally {
      setShowGameModal(false);
      setSelectedCompetition(null);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const openInviteModal = (competition) => {
    setSelectedCompetition(competition);
    setShowInviteModal(true);
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#00FF85';
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
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
    return status?.toUpperCase() || 'UNKNOWN';
  };

  // Combine competitions for active tab
  const activeCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING'),
    ...participatedCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING')
  ].filter((comp, index, self) =>
    index === self.findIndex(c => c.id === comp.id)
  );

  const completedCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED'),
    ...participatedCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED')
  ].filter((comp, index, self) =>
    index === self.findIndex(c => c.id === comp.id)
  );

  if (loading.myCompetitions || loading.participatedCompetitions) {
    return (
      <div className="playpage animated-bg">
        <Container fluid className="py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
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
        {/* Real-time Notifications */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <Alert
              key={notification.id}
              variant={notification.type === 'success' ? 'success' :
                notification.type === 'error' ? 'danger' :
                  notification.type === 'warning' ? 'warning' : 'info'}
              className="notification-alert"
              dismissible
              onClose={() => removeNotification(notification.id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>{notification.message}</span>
                <small>{notification.timestamp.toLocaleTimeString()}</small>
              </div>
            </Alert>
          ))}
        </div>

        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 className="cyber-text text-neon mb-2">
                    <Play size={32} className="me-3" />
                    Gaming Arena
                  </h1>
                  <p className="text-white mb-0">Compete, earn, and dominate the leaderboards</p>
                </div>
                <div className="player-stats d-flex gap-3 flex-wrap">
                  <div className="stat-item text-center">
                    <div className="stat-value text-neon fw-bold h5">KSh {walletBalance}</div>
                    <div className="stat-label text-white small">Balance</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      className="btn-cyber"
                      onClick={() => setShowJoinModal(true)}
                    >
                      <UserPlus size={20} className="me-2" />
                      <span className="d-none d-sm-inline">Join Game</span>
                    </Button>
                    <Button
                      variant="outline-light"
                      onClick={() => setShowInvitesModal(true)}
                    >
                      <Mail size={20} />
                      {(pendingInvites?.length || 0) > 0 && (
                        <Badge bg="danger" className="ms-1">
                          {pendingInvites?.length || 0}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline-light"
                      onClick={() => setShowFriendsModal(true)}
                    >
                      <Users size={20} />
                      {(friendRequests?.received?.length || 0) > 0 && (
                        <Badge bg="info" className="ms-1">
                          {friendRequests?.received?.length || 0}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline-light"
                      onClick={() => setShowHistoryModal(true)}
                    >
                      <History size={20} />
                    </Button>
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
              <Tab eventKey="active" title={`Active (${activeCompetitions.length})`}>
                <div className="competitions-list">
                  {activeCompetitions.length === 0 ? (
                    <Card className="cyber-card text-center py-5">
                      <Card.Body>
                        <GamepadIcon size={48} className="text-grey mb-3" />
                        <h5 className="text-white mb-2">No Active Competitions</h5>
                        <p className="text-grey mb-3">Join or create a competition to start playing!</p>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            className="btn-cyber"
                            onClick={() => setShowJoinModal(true)}
                          >
                            <UserPlus size={20} className="me-2" />
                            Join Competition
                          </Button>
                          <Button
                            variant="outline-light"
                            href="/make-game"
                          >
                            Create Competition
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    activeCompetitions.map(comp => (
                      <CompetitionCard
                        key={comp.id}
                        competition={comp}
                        onPlay={handlePlayClick}
                        onInvite={openInviteModal}
                        onCopyCode={handleCopyCode}
                        copiedCode={copiedCode}
                        isActive={true}
                      />
                    ))
                  )}
                </div>
              </Tab>

              <Tab eventKey="completed" title={`Completed (${completedCompetitions.length})`}>
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
                      <CompetitionCard
                        key={comp.id}
                        competition={comp}
                        onPlay={handlePlayClick}
                        onInvite={openInviteModal}
                        onCopyCode={handleCopyCode}
                        copiedCode={copiedCode}
                        isActive={false}
                      />
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
                <Badge className="pulse" style={{ background: '#00FF85' }}>LIVE</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="leaderboard-list">
                  {leaderboard.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-grey mb-0">No leaderboard data available</p>
                    </div>
                  ) : (
                    leaderboard.map((player, index) => (
                      <div
                        key={player.id || index}
                        className={`leaderboard-item p-3 d-flex align-items-center ${player.isCurrentUser ? 'user-row' : ''}`}
                      >
                        <div
                          className="rank-badge me-3"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: getRankColor(player.rank || index + 1),
                            color: '#0E0E10',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {player.rank || index + 1}
                        </div>

                        <div className="player-avatar me-3" style={{ fontSize: '1.5rem' }}>
                          {player.avatar || '🎮'}
                        </div>

                        <div className="player-info flex-grow-1">
                          <div className="player-name fw-bold text-white">
                            {player.username}
                            {player.isCurrentUser && <span className="text-neon ms-2">(You)</span>}
                          </div>
                          <div className="player-score text-grey small">
                            KSh {player.totalEarnings?.toLocaleString() || 0} earned
                          </div>
                        </div>

                        {(player.rank || index + 1) <= 3 && (
                          <div className="trophy-icon">
                            <Trophy size={16} color={getRankColor(player.rank || index + 1)} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Invitations & Notifications Modal */}
      <Modal
        show={showInvitesModal}
        onHide={() => setShowInvitesModal(false)}
        className="cyber-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Mail size={24} className="me-2 text-neon" />
            Game Invitations
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="pending" className="mb-3">
            <Tab eventKey="pending" title={`Pending Invites (${pendingInvites?.length || 0})`}>
              {(!pendingInvites || pendingInvites.length === 0) ? (
                <div className="text-center py-4">
                  <Mail size={48} className="text-grey mb-3" />
                  <p className="text-grey">No pending game invitations</p>
                </div>
              ) : (
                <ListGroup>
                  {pendingInvites.map(invite => (
                    <ListGroup.Item key={invite.id} className="cyber-card mb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-3" style={{ fontSize: '2rem' }}>
                              {invite.Competition?.game?.imageUrl ? (
                                <img
                                  src={invite.Competition.game.imageUrl}
                                  alt="Game"
                                  style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                                />
                              ) : '🎮'}
                            </div>
                            <div>
                              <strong className="text-white">{invite.Competition?.title}</strong>
                              <div className="text-grey small">
                                from <strong>{invite.inviter?.username}</strong>
                              </div>
                              <div className="text-grey small">
                                {invite.Competition?.game?.name} • Entry: KSh {invite.Competition?.entryFee}
                              </div>
                            </div>
                          </div>
                          <small className="text-grey">
                            Received {new Date(invite.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptInvite(invite.id)}
                            disabled={loadingStates[`acceptingInvite_${invite.id}`]}
                          >
                            {loadingStates[`acceptingInvite_${invite.id}`] ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeclineInvite(invite.id)}
                            disabled={loadingStates[`decliningInvite_${invite.id}`]}
                          >
                            {loadingStates[`decliningInvite_${invite.id}`] ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <UserX size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab>

            <Tab eventKey="sent" title={`Sent Invites (${sentInvites?.length || 0})`}>
              {(!sentInvites || sentInvites.length === 0) ? (
                <div className="text-center py-4">
                  <Send size={48} className="text-grey mb-3" />
                  <p className="text-grey">No sent invitations</p>
                </div>
              ) : (
                <ListGroup>
                  {sentInvites.map(invite => (
                    <ListGroup.Item key={invite.id} className="cyber-card mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-white">{invite.Competition?.title}</strong>
                          <div className="text-grey small">
                            to <strong>{invite.inviteeUsername}</strong>
                          </div>
                          <small className="text-grey">
                            Sent {new Date(invite.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <Badge bg={invite.accepted ? "success" : "warning"}>
                          {invite.accepted ? "Accepted" : "Pending"}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

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
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Competition Code</Form.Label>
            <Form.Control
              type="text"
              className="cyber-input"
              placeholder="Enter competition code (e.g., ABC123)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <Form.Text className="text-grey">Enter the 6-8 character competition code</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowJoinModal(false)}>
            Cancel
          </Button>
          <Button
            className="btn-cyber"
            onClick={handleJoinByCode}
            disabled={!joinCode.trim() || loadingStates.joiningByCode}
          >
            {loadingStates.joiningByCode ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <UserPlus size={18} className="me-2" />
            )}
            Join Competition
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Invite Player Modal */}
      <Modal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        className="cyber-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Send size={24} className="me-2 text-neon" />
            Invite Player
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6 className="text-white">Competition: {selectedCompetition?.title}</h6>
            <small className="text-grey">Code: {selectedCompetition?.code}</small>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">Username</Form.Label>
            <Form.Control
              type="text"
              className="cyber-input"
              placeholder="Enter player's username"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
            />
          </Form.Group>

          {friends && friends.length > 0 && (
            <div className="mb-3">
              <Form.Label className="text-white">Or select from friends:</Form.Label>
              <div className="friends-list">
                {friends.slice(0, 5).map(friend => (
                  <Button
                    key={friend.id}
                    variant="outline-light"
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => setInviteUsername(friend.username)}
                  >
                    {friend.username}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button
            className="btn-cyber"
            onClick={handleInvitePlayer}
            disabled={!inviteUsername.trim() || loadingStates.invitingPlayer}
          >
            {loadingStates.invitingPlayer ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Send size={18} className="me-2" />
            )}
            Send Invitation
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Friends & Requests Modal */}
      <Modal
        show={showFriendsModal}
        onHide={() => setShowFriendsModal(false)}
        className="cyber-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Users size={24} className="me-2 text-neon" />
            Friends & Friend Requests
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="requests" className="mb-3">
            <Tab eventKey="requests" title={`Friend Requests (${friendRequests?.received?.length || 0})`}>
              <div className="mb-3">
                <h6 className="text-white">Received Friend Requests</h6>
                {(!friendRequests?.received || friendRequests.received.length === 0) ? (
                  <p className="text-grey">No pending friend requests</p>
                ) : (
                  <ListGroup>
                    {friendRequests.received.map(request => (
                      <ListGroup.Item key={request.id} className="cyber-card mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-white">{request.from?.username || request.username}</strong>
                            <small className="text-grey d-block">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAcceptFriendRequest(request.id)}
                              disabled={loadingStates[`acceptingRequest_${request.id}`]}
                            >
                              <UserCheck size={16} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeclineFriendRequest(request.id)}
                              disabled={loadingStates[`decliningRequest_${request.id}`]}
                            >
                              {loadingStates[`decliningRequest_${request.id}`] ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <UserX size={16} />
                              )}
                            </Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>

              <div className="mb-3">
                <h6 className="text-white">Sent Friend Requests</h6>
                {(!friendRequests?.sent || friendRequests.sent.length === 0) ? (
                  <p className="text-grey">No pending sent requests</p>
                ) : (
                  <ListGroup>
                    {friendRequests.sent.map(request => (
                      <ListGroup.Item key={request.id} className="cyber-card mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-white">{request.to?.username || request.username}</strong>
                            <small className="text-grey d-block">
                              Sent {new Date(request.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <Badge bg="warning">Pending</Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>

              <div>
                <h6 className="text-white">Send New Friend Request</h6>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    className="cyber-input"
                    placeholder="Enter username"
                    value={friendRequestUsername}
                    onChange={(e) => setFriendRequestUsername(e.target.value)}
                  />
                  <Button
                    className="btn-cyber"
                    onClick={handleSendFriendRequest}
                    disabled={!friendRequestUsername.trim() || loadingStates.sendingFriendRequest}
                  >
                    {loadingStates.sendingFriendRequest ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </Tab>

            <Tab eventKey="friends" title={`Friends (${friends?.length || 0})`}>
              {(!friends || friends.length === 0) ? (
                <div className="text-center py-4">
                  <Users size={48} className="text-grey mb-3" />
                  <p className="text-grey">No friends yet</p>
                </div>
              ) : (
                <ListGroup>
                  {friends.map(friend => (
                    <ListGroup.Item key={friend.id} className="cyber-card mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-white">{friend.username}</strong>
                          <small className="text-grey d-block">
                            Friends since {new Date(friend.friendsSince || friend.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <Button variant="outline-light" size="sm">
                          <MessageCircle size={16} />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      {/* Game History Modal */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        className="cyber-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <History size={24} className="me-2 text-neon" />
            Game History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(!gameHistory || gameHistory.length === 0) ? (
            <div className="text-center py-4">
              <History size={48} className="text-grey mb-3" />
              <p className="text-grey">No game history available</p>
            </div>
          ) : (
            <ListGroup>
              {gameHistory.map(player => (
                <ListGroup.Item key={player.playerId || player.id} className="cyber-card mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="text-white">{player.username}</strong>
                      <div className="text-grey small">
                        {player.gamesPlayed} games played • Last: {new Date(player.lastPlayed).toLocaleDateString()}
                      </div>
                      <div className="mt-1">
                        {player.gameTypes?.map(type => (
                          <Badge key={type} className="me-1" style={{ background: '#9B00FF' }}>
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => {
                        setInviteUsername(player.username);
                        setShowHistoryModal(false);
                        // Need to select a competition first
                        if (activeCompetitions.length > 0) {
                          setSelectedCompetition(activeCompetitions[0]);
                          setShowInviteModal(true);
                        }
                      }}
                    >
                      Invite Again
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        amount={selectedCompetition?.entryFee || 0}
        onSuccess={() => {
          loadWalletBalance();
          setShowPaymentModal(false);
          if (selectedCompetition) {
            setShowGameModal(true);
          }
        }}
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
            <DinoGame onGameEnd={handleGameEnd} />
          )}
        </Modal.Body>
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
        .playpage {
          min-height: 100vh;
          background: linear-gradient(135deg, #0E0E10 0%, #1A1A1E 100%);
        }

        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1060;
          max-width: 400px;
        }

        .notification-alert {
          margin-bottom: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 240, 255, 0.3);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .cyber-card {
          background: rgba(31, 31, 35, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .cyber-tabs .nav-link {
          background: transparent;
          border: 1px solid rgba(0, 240, 255, 0.3);
          color: #B0B0B0;
          margin-right: 10px;
          border-radius: 20px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }

        .cyber-tabs .nav-link.active {
          background: rgba(0, 240, 255, 0.1);
          color: #00F0FF;
          border-color: #00F0FF;
        }

        .cyber-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 240, 255, 0.3);
          color: #fff;
          border-radius: 8px;
        }

        .cyber-input:focus {
          background: rgba(0, 0, 0, 0.5);
          border-color: #00F0FF;
          box-shadow: 0 0 0 0.2rem rgba(0, 240, 255, 0.25);
          color: #fff;
        }

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

        .competition-card {
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .competition-card:hover {
          transform: translateX(5px);
          border-left-color: #00F0FF;
        }

        .text-neon { color: #00F0FF; }
        .text-purple { color: #9B00FF; }
        .text-energy-green { color: #00FF85; }
        .text-cyber-red { color: #FF003C; }
        .text-grey { color: #B0B0B0; }

        .leaderboard-item {
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover {
          background: rgba(0, 240, 255, 0.05);
        }

        .user-row {
          background: rgba(0, 240, 255, 0.1);
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

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .cyber-modal .modal-content {
          background: rgba(31, 31, 35, 0.95);
          border: 1px solid rgba(0, 240, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .cyber-modal .modal-header {
          border-bottom: 1px solid rgba(0, 240, 255, 0.3);
        }

        .cyber-modal .list-group-item {
          background: rgba(31, 31, 35, 0.8);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
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
          background: rgba(14, 14, 16, 0.95);
          border: 1px solid rgba(0, 240, 255, 0.3);
        }

        .friends-list {
          max-height: 120px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

// Competition Card Component
const CompetitionCard = ({ competition, onPlay, onInvite, onCopyCode, copiedCode, isActive }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return '#00F0FF';
      case 'ONGOING': return '#00FF85';
      case 'COMPLETED': return '#B0B0B0';
      case 'CANCELED': return '#FF003C';
      default: return '#B0B0B0';
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#00FF85';
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
    return '#B0B0B0';
  };

  return (
    <Card className="cyber-card mb-3 competition-card">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="text-white mb-1">{competition.title}</h5>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <Badge style={{ background: '#9B00FF' }}>
                    {competition.Game?.name || competition.gameName || 'Unknown Game'}
                  </Badge>
                  <Badge style={{ background: getStatusColor(competition.status) }}>
                    {competition.status}
                  </Badge>
                  {competition.playedCount > 0 && (
                    <Badge style={{ background: '#00FF85' }}>
                      {competition.playedCount} played
                    </Badge>
                  )}
                </div>
                <div className="competition-code d-flex align-items-center mb-2">
                  <span className="text-grey me-2">Code:</span>
                  <code
                    className="text-neon bg-dark px-2 py-1 rounded cursor-pointer"
                    onClick={() => onCopyCode(competition.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    {competition.code}
                  </code>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2"
                    onClick={() => onCopyCode(competition.code)}
                  >
                    {copiedCode === competition.code ? (
                      <Check size={14} color="#00FF85" />
                    ) : (
                      <Copy size={14} color="#B0B0B0" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rank-display text-center">
                {isActive ? (
                  <>
                    <div className="rank-number fw-bold h3 text-neon">
                      #{competition.currentRank || competition.rank || '0'}
                    </div>
                    <small className="text-white">of {competition.currentPlayers || competition.totalPlayers}</small>
                  </>
                ) : (
                  <>
                    <div
                      className="rank-number fw-bold h3"
                      style={{ color: getRankColor(competition.finalRank || competition.rank) }}
                    >
                      #{competition.finalRank || competition.rank || '0'}
                    </div>
                    <small className="text-white">Final</small>
                  </>
                )}
              </div>
            </div>

            <div className="competition-stats mb-3">
              <Row className="g-2">
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Trophy size={16} color="#00F0FF" className="me-2" />
                    <span className="text-neon small">
                      {isActive ? `KSh ${competition.totalPrizePool || competition.prizePool || 0}` : `${competition.finalScore || competition.score || 0} pts`}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Clock size={16} color="#FF003C" className="me-2" />
                    <span className="text-cyber-red small">{competition.minutesToPlay || competition.duration || 0}min</span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Users size={16} color="#9B00FF" className="me-2" />
                    <span className="text-purple small">
                      {competition.currentPlayers || competition.participantCount || 0}/{competition.maxPlayers || 'unlimited'}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Zap size={16} color="#00FF85" className="me-2" />
                    <span className="text-energy-green small">
                      {isActive ? `KSh ${competition.entryFee || 0}` : `KSh ${competition.earnings || 0}`}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Players who have played */}
            {competition.participants && competition.participants.length > 0 && (
              <div className="players-status mb-3">
                <small className="text-grey">Players: </small>
                <div className="d-flex flex-wrap gap-1">
                  {competition.participants.slice(0, 5).map((participant, index) => (
                    <Badge
                      key={participant.id || index}
                      style={{
                        background: participant.hasPlayed || participant.score !== null ? '#00FF85' : '#FF003C',
                        fontSize: '0.7rem'
                      }}
                    >
                      {participant.user?.username || participant.username} {(participant.hasPlayed || participant.score !== null) && '✓'}
                    </Badge>
                  ))}
                  {competition.participants.length > 5 && (
                    <Badge style={{ background: '#B0B0B0', fontSize: '0.7rem' }}>
                      +{competition.participants.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Col>

          <Col md={4} className="text-end">
            {isActive && (
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onInvite(competition)}
                  className="w-100"
                >
                  <Send size={16} className="me-2" />
                  Invite Players
                </Button>
                <Button
                  className="btn-cyber w-100"
                  onClick={() => onPlay(competition)}
                  disabled={competition.hasPlayed || competition.userHasPlayed}
                >
                  {(competition.hasPlayed || competition.userHasPlayed) ? (
                    <>
                      <Check size={20} className="me-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play size={20} className="me-2" />
                      Play Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PlayPage;