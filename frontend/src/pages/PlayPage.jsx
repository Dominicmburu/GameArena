import React, { useState, useEffect, useMemo } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Compass, Gamepad2, TrendingUp } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useSocket } from '../contexts/SocketContext'
import { useWallet } from '../contexts/WalletContext'
import PageHeader from '../components/playpage/PageHeader'
import BrowseCompetitions from '../components/playpage/BrowseCompetitions'
import CompetitionsTabs from '../components/playpage/CompetitionsTabs'
import GlobalLeaderboard from '../components/playpage/GlobalLeaderboard'
import NotificationsContainer from '../components/playpage/NotificationsContainer'
import ModalsContainer from '../components/playpage/ModalsContainer'
import ToastNotification from '../components/playpage/ToastNotification'
import useSocketEvents from '../hooks/useSocketEvents'
import useDataLoader from '../hooks/useDataLoader'
import useModalHandlers from '../hooks/useModalHandlers'
import '../styles/PlayPage.css'

const PlayPage = () => {
  const [mainTab, setMainTab] = useState('browse')      // 'browse' | 'mygames'
  const [myGamesTab, setMyGamesTab] = useState('active')
  const [leaderboard, setLeaderboard] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState('success')

  const { socket, connected, error: socketError, emit, subscribe } = useSocket()
  const { balance, fetchBalance } = useWallet()

  const {
    myCompetitions,
    participatedCompetitions,
    publicCompetitions,
    friends,
    friendRequests,
    gameHistory,
    pendingInvites,
    sentInvites,
    loading,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchPublicCompetitions,
    fetchGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
  } = useGame()

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message)
    setToastVariant(variant)
    setShowToast(true)
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [{ id, message, type, timestamp: new Date() }, ...prev.slice(0, 4)])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000)
  }

  const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  const { loadUserData } = useDataLoader({
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchPublicCompetitions,
    fetchGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
    setLeaderboard,
    showToastMessage,
    fetchBalance,
  })

  useSocketEvents({
    socket, connected, socketError,
    myCompetitions, participatedCompetitions,
    emit, subscribe,
    addNotification, loadUserData,
    fetchPendingInvites, fetchSentInvites,
    fetchFriends, fetchFriendRequests,
  })

  const modalHandlers = useModalHandlers({
    loadUserData, showToastMessage,
    fetchPendingInvites, fetchSentInvites,
    fetchFriends, fetchFriendRequests,
    walletBalance: balance,
  })

  useEffect(() => { loadUserData() }, [])

  const activeCompetitions = useMemo(() => {
    const combined = [
      ...myCompetitions.filter(c => c.status === 'UPCOMING' || c.status === 'ONGOING'),
      ...participatedCompetitions.filter(c => c.status === 'UPCOMING' || c.status === 'ONGOING'),
    ]
    return combined.filter((c, i, self) => i === self.findIndex(x => x.id === c.id))
  }, [myCompetitions, participatedCompetitions])

  const completedCompetitions = useMemo(() => {
    const combined = [
      ...myCompetitions.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELED'),
      ...participatedCompetitions.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELED'),
    ]
    return combined.filter((c, i, self) => i === self.findIndex(x => x.id === c.id))
  }, [myCompetitions, participatedCompetitions])

  // IDs the user has already joined — filter them out of Browse
  const participatedIds = useMemo(() => {
    const ids = new Set()
    activeCompetitions.forEach(c => ids.add(c.id))
    return ids
  }, [activeCompetitions])

  const isInitialLoading = loading.myCompetitions || loading.participatedCompetitions

  if (isInitialLoading && myCompetitions.length === 0 && publicCompetitions.length === 0) {
    return (
      <div className="pp-page">
        <div className="pp-loader">
          <Spinner animation="border" style={{ color: '#C53030' }} />
          <div>Loading competitions...</div>
        </div>
      </div>
    )
  }

  const mainTabs = [
    { key: 'browse',  label: 'Browse Competitions', Icon: Compass,   count: publicCompetitions.filter(c => !participatedIds.has(c.id) && (c.status === 'ONGOING' || c.status === 'UPCOMING')).length },
    { key: 'mygames', label: 'My Games',            Icon: Gamepad2,  count: activeCompetitions.length },
  ]

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        <NotificationsContainer
          notifications={notifications}
          removeNotification={removeNotification}
        />

        <PageHeader
          pendingInvites={pendingInvites}
          friendRequests={friendRequests}
          onJoinClick={modalHandlers.openJoinModal}
          onInvitesClick={modalHandlers.openInvitesModal}
          onFriendsClick={modalHandlers.openFriendsModal}
        />

        {/* Main tabs */}
        <div className="pp-maintabs">
          {mainTabs.map(t => (
            <button
              key={t.key}
              type="button"
              className={`pp-maintab ${mainTab === t.key ? 'active' : ''}`}
              onClick={() => setMainTab(t.key)}
            >
              <t.Icon size={15} />
              <span>{t.label}</span>
              {t.count > 0 && <span className="pp-maintab-count">{t.count}</span>}
            </button>
          ))}
          <button
            type="button"
            className={`pp-maintab pp-maintab--mobile ${mainTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setMainTab('leaderboard')}
          >
            <TrendingUp size={15} />
            <span>Leaderboard</span>
          </button>
        </div>

        <div className="pp-layout">
          <div className="pp-main">
            {mainTab === 'browse' && (
              <BrowseCompetitions
                publicCompetitions={publicCompetitions}
                participatedIds={participatedIds}
                onJoin={modalHandlers.handleJoinPublic}
                onCopyCode={modalHandlers.handleCopyCode}
                copiedCode={modalHandlers.copiedCode}
                loading={loading.publicCompetitions}
              />
            )}
            {mainTab === 'mygames' && (
              <CompetitionsTabs
                activeTab={myGamesTab}
                setActiveTab={setMyGamesTab}
                activeCompetitions={activeCompetitions}
                completedCompetitions={completedCompetitions}
                onPlay={modalHandlers.handlePlayClick}
                onInvite={modalHandlers.openInviteModal}
                onCopyCode={modalHandlers.handleCopyCode}
                onLeave={modalHandlers.handleLeaveCompetition}
                copiedCode={modalHandlers.copiedCode}
                onJoinClick={modalHandlers.openJoinModal}
              />
            )}
            {mainTab === 'leaderboard' && (
              <div className="pp-leaderboard-mobile">
                <GlobalLeaderboard leaderboard={leaderboard} />
              </div>
            )}
          </div>

          <aside className="pp-aside">
            <GlobalLeaderboard leaderboard={leaderboard} />
          </aside>
        </div>
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
  )
}

export default PlayPage
