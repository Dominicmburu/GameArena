import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Play } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';
import { useWallet } from '../contexts/WalletContext';
import PageHeader from '../components/playpage/PageHeader';
import CompetitionsTabs from '../components/playpage/CompetitionsTabs';
import GlobalLeaderboard from '../components/playpage/GlobalLeaderboard';
import NotificationsContainer from '../components/playpage/NotificationsContainer';
import ModalsContainer from '../components/playpage/ModalsContainer';
import ToastNotification from '../components/playpage/ToastNotification';
import useSocketEvents from '../hooks/useSocketEvents';
import useDataLoader from '../hooks/useDataLoader';
import useModalHandlers from '../hooks/useModalHandlers';
import '../styles/PlayPage.css';

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const { socket, connected, error: socketError, emit, subscribe } = useSocket();
  const { balance, fetchBalance } = useWallet();

  const {
    myCompetitions,
    participatedCompetitions,
    friends,
    friendRequests,
    gameHistory,
    pendingInvites,
    sentInvites,
    loading,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
  } = useGame();

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Custom hooks
  const { loadUserData } = useDataLoader({
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
    setLeaderboard,
    showToastMessage,
    fetchBalance
  });

  useSocketEvents({
    socket,
    connected,
    socketError,
    myCompetitions,
    participatedCompetitions,
    emit,
    subscribe,
    addNotification,
    loadUserData,
    fetchPendingInvites,
    fetchSentInvites,
    fetchFriends,
    fetchFriendRequests
  });

  const modalHandlers = useModalHandlers({
    loadUserData,
    showToastMessage,
    fetchPendingInvites,
    fetchSentInvites,
    fetchFriends,
    fetchFriendRequests,
    walletBalance: balance
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Combine competitions for active/completed tabs
  const activeCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING'),
    ...participatedCompetitions.filter(comp => comp.status === 'UPCOMING' || comp.status === 'ONGOING')
  ].filter((comp, index, self) => index === self.findIndex(c => c.id === comp.id));

  const completedCompetitions = [
    ...myCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED'),
    ...participatedCompetitions.filter(comp => comp.status === 'COMPLETED' || comp.status === 'CANCELED')
  ].filter((comp, index, self) => index === self.findIndex(c => c.id === comp.id));

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
        <NotificationsContainer
          notifications={notifications}
          removeNotification={removeNotification}
        />

        <Row className="mb-4">
          <Col>
            <PageHeader
              pendingInvites={pendingInvites}
              friendRequests={friendRequests}
              onJoinClick={modalHandlers.openJoinModal}
              onInvitesClick={modalHandlers.openInvitesModal}
              onFriendsClick={modalHandlers.openFriendsModal}
              onHistoryClick={modalHandlers.openHistoryModal}
            />
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <CompetitionsTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeCompetitions={activeCompetitions}
              completedCompetitions={completedCompetitions}
              onPlay={modalHandlers.handlePlayClick}
              onInvite={modalHandlers.openInviteModal}
              onCopyCode={modalHandlers.handleCopyCode}
              onLeave={modalHandlers.handleLeaveCompetition}
              copiedCode={modalHandlers.copiedCode}
              onJoinClick={modalHandlers.openJoinModal}
            />
          </Col>

          <Col lg={4}>
            <GlobalLeaderboard leaderboard={leaderboard} />
          </Col>
        </Row>
      </Container>

      <ModalsContainer
        {...modalHandlers.modalStates}
        {...modalHandlers.formStates}
        loadingStates={modalHandlers.loadingStates}
        friends={friends}
        friendRequests={friendRequests}
        pendingInvites={pendingInvites}
        sentInvites={sentInvites}
        gameHistory={gameHistory}
        activeCompetitions={activeCompetitions}
        onJoinByCode={modalHandlers.handleJoinByCode}
        onInvitePlayer={modalHandlers.handleInvitePlayer}
        onAcceptInvite={modalHandlers.handleAcceptInvite}
        onDeclineInvite={modalHandlers.handleDeclineInvite}
        onSendFriendRequest={modalHandlers.handleSendFriendRequest}
        onAcceptFriendRequest={modalHandlers.handleAcceptFriendRequest}
        onDeclineFriendRequest={modalHandlers.handleDeclineFriendRequest}
        onGameEnd={modalHandlers.handleGameEnd}
        onPaymentSuccess={modalHandlers.handlePaymentSuccess}
        closeAllModals={modalHandlers.closeAllModals}
        setFormValue={modalHandlers.setFormValue}
        confirmJoinByCode={modalHandlers.confirmJoinByCode}
        confirmAcceptInvite={modalHandlers.confirmAcceptInvite}
        handleTopUpFromConfirm={modalHandlers.handleTopUpFromConfirm}
        setShowJoinConfirmModal={modalHandlers.setShowJoinConfirmModal}
        setShowAcceptConfirmModal={modalHandlers.setShowAcceptConfirmModal}
        confirmLeaveCompetition={modalHandlers.confirmLeaveCompetition}
        setShowLeaveConfirmModal={modalHandlers.setShowLeaveConfirmModal}
      />

      <ToastNotification
        show={showToast}
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default PlayPage;