import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useWallet } from '../contexts/WalletContext';


const useModalHandlers = ({
  loadUserData,
  showToastMessage,
  fetchPendingInvites,
  fetchSentInvites,
  fetchFriends,
  fetchFriendRequests,
  walletBalance
}) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [friendRequestUsername, setFriendRequestUsername] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [loadingStates, setLoadingStates] = useState({});

  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
  const [pendingJoinCompetition, setPendingJoinCompetition] = useState(null);
  const [pendingAcceptInvite, setPendingAcceptInvite] = useState(null);

  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingLeaveCompetition, setPendingLeaveCompetition] = useState(null);

  const {
    joinCompetitionByCode,
    invitePlayerByUsername,
    acceptInvite,
    declineInvite,
    submitScore,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getCompetitionByCode,
    leaveCompetition,      // ADD THIS
    getTimeRemaining
  } = useGame();

  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const closeAllModals = (type) => {
    if (type === 'join') setShowJoinModal(false);
    else if (type === 'invite') setShowInviteModal(false);
    else if (type === 'invites') setShowInvitesModal(false);
    else if (type === 'friends') setShowFriendsModal(false);
    else if (type === 'history') setShowHistoryModal(false);
    else if (type === 'payment') setShowPaymentModal(false);
    else if (type === 'game') setShowGameModal(false);
    else if (type === 'invite-open') setShowInviteModal(true);
  };

  const setFormValue = (field, value) => {
    if (field === 'joinCode') setJoinCode(value);
    else if (field === 'inviteUsername') setInviteUsername(value);
    else if (field === 'friendRequestUsername') setFriendRequestUsername(value);
    else if (field === 'selectedCompetition') setSelectedCompetition(value);
  };

  const getErrorMessage = (error) => {
    const errorMap = {
      'NOT_FOUND': 'Competition not found',
      'COMPETITION_ENDED': 'This competition has ended',
      'FULL': 'Competition is full',
      'INSUFFICIENT_FUNDS': 'Insufficient wallet balance. Please top up your wallet.',
      'ALREADY_JOINED': 'You are already in this competition',
      'FORBIDDEN': 'You do not have permission to perform this action',
      'USER_NOT_FOUND': 'User not found',
      'SELF_INVITE': 'You cannot invite yourself',
      'INVITE_EXISTS': 'This user has already been invited',
      'INVITE_NOT_FOUND': 'Invitation not found or expired',
      'ALREADY_ACCEPTED': 'This invitation has already been accepted',
      'SELF_REQUEST': 'You cannot send a friend request to yourself',
      'ALREADY_FRIENDS': 'You are already friends with this user',
      'REQUEST_EXISTS': 'Friend request already exists',
      'INVALID_STATUS': 'This request has already been processed',
      'NOT_JOINED': 'You are not a participant in this competition',
      'INVALID_PLAY_TIME': 'Invalid play time detected',
      'GAME_NOT_FOUND': 'Game not found',
      'ENTRY_FEE_BELOW_MIN': 'Entry fee is below minimum requirement',
      'EXCEEDS_MAX_PLAYERS': 'Player limit exceeds game maximum',
      'BELOW_MIN_PLAYERS': 'Player count is below game minimum',
    };

    if (error.response?.data?.error) {
      const errorCode = error.response.data.error;
      return errorMap[errorCode] || error.response.data.message || 'An error occurred';
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred';
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      showToastMessage('Please enter a competition code', 'error');
      return;
    }

    const codePattern = /^[A-Z0-9]{4,10}$/i;
    if (!codePattern.test(joinCode.trim())) {
      showToastMessage('Invalid competition code format', 'error');
      return;
    }

    try {
      setLoading('fetchingCompetition', true);

      // Fetch competition details - FIXED: Use the correct method
      const competitionDetails = await getCompetitionByCode(joinCode.trim().toUpperCase());

      if (competitionDetails.alreadyJoined) {
        showToastMessage('You are already in this competition', 'info');
        setShowJoinModal(false);
        setJoinCode('');
        return;
      }

      setPendingJoinCompetition(competitionDetails);
      setShowJoinModal(false);
      setShowJoinConfirmModal(true);
    } catch (error) {
      console.error('Error fetching competition:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading('fetchingCompetition', false);
    }
  };

  const confirmJoinByCode = async () => {
    if (!pendingJoinCompetition) {
      showToastMessage('No competition selected', 'error');
      return;
    }

    try {
      setLoading('joiningByCode', true);
      const result = await joinCompetitionByCode(pendingJoinCompetition.code);

      showToastMessage(
        `Successfully joined! Players: ${result.currentPlayers}/${result.maxPlayers}`,
        'success'
      );

      await loadUserData();
      setShowJoinConfirmModal(false);
      setPendingJoinCompetition(null);
      setJoinCode('');
    } catch (error) {
      console.error('Error joining competition:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
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

    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(inviteUsername.trim())) {
      showToastMessage('Invalid username format', 'error');
      return;
    }

    if (selectedCompetition.currentPlayers >= selectedCompetition.maxPlayers) {
      showToastMessage('Competition is full', 'error');
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

      if (fetchSentInvites) {
        await fetchSentInvites();
      }
    } catch (error) {
      console.error('Error inviting player:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading('invitingPlayer', false);
    }
  };

  const handleAcceptInvite = async (invite) => {
    if (!invite) {
      showToastMessage('Invalid invitation', 'error');
      return;
    }

    setPendingAcceptInvite(invite);
    setShowInvitesModal(false);
    setShowAcceptConfirmModal(true);
  };

  const confirmAcceptInvite = async () => {
    if (!pendingAcceptInvite) {
      showToastMessage('No invitation selected', 'error');
      return;
    }

    try {
      setLoading(`acceptingInvite_${pendingAcceptInvite.id}`, true);
      const result = await acceptInvite(pendingAcceptInvite.id);

      showToastMessage(
        `Invitation accepted! Joined ${pendingAcceptInvite.Competition.title}`,
        'success'
      );

      await loadUserData();

      if (fetchPendingInvites) {
        await fetchPendingInvites();
      }

      setShowAcceptConfirmModal(false);
      setPendingAcceptInvite(null);
    } catch (error) {
      console.error('Error accepting invite:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(`acceptingInvite_${pendingAcceptInvite?.id}`, false);
    }
  };

  const handleTopUpFromConfirm = () => {
    setShowJoinConfirmModal(false);
    setShowAcceptConfirmModal(false);
    setShowPaymentModal(true);
  };

  const handleDeclineInvite = async (inviteId) => {
    if (!inviteId) {
      showToastMessage('Invalid invitation', 'error');
      return;
    }

    try {
      setLoading(`decliningInvite_${inviteId}`, true);
      await declineInvite(inviteId);

      showToastMessage('Invitation declined', 'info');

      if (fetchPendingInvites) {
        await fetchPendingInvites();
      }
    } catch (error) {
      console.error('Error declining invite:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(`decliningInvite_${inviteId}`, false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendRequestUsername.trim()) {
      showToastMessage('Please enter a username', 'error');
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(friendRequestUsername.trim())) {
      showToastMessage('Invalid username format', 'error');
      return;
    }

    try {
      setLoading('sendingFriendRequest', true);
      await sendFriendRequest({ username: friendRequestUsername.trim() });

      showToastMessage(`Friend request sent to ${friendRequestUsername}!`, 'success');
      setFriendRequestUsername('');

      if (fetchFriendRequests) {
        await fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading('sendingFriendRequest', false);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    if (!requestId) {
      showToastMessage('Invalid friend request', 'error');
      return;
    }

    try {
      setLoading(`acceptingRequest_${requestId}`, true);
      await acceptFriendRequest(requestId);

      showToastMessage('Friend request accepted!', 'success');

      await Promise.all([
        fetchFriends?.(),
        fetchFriendRequests?.()
      ].filter(Boolean));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(`acceptingRequest_${requestId}`, false);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    if (!requestId) {
      showToastMessage('Invalid friend request', 'error');
      return;
    }

    try {
      setLoading(`decliningRequest_${requestId}`, true);
      await declineFriendRequest(requestId);

      showToastMessage('Friend request declined', 'info');

      if (fetchFriendRequests) {
        await fetchFriendRequests();
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(`decliningRequest_${requestId}`, false);
    }
  };

  const handlePlayClick = async (competition) => {
    if (!competition) {
      showToastMessage('Invalid competition', 'error');
      return;
    }

    // CHECK 1: Competition status
    if (competition.status === 'COMPLETED' || competition.status === 'CANCELED') {
      showToastMessage('This competition has ended', 'error');
      return;
    }

    // CHECK 2: Already played
    if (competition.hasPlayed) {
      showToastMessage('You have already played this competition', 'info');
      return;
    }

    // CHECK 3: Verify competition hasn't expired
    try {
      setLoading('checkingTime', true);
      const timeData = await getTimeRemaining(competition.code); // Use from GameContext

      if (timeData.isExpired || timeData.timeRemaining === 0) {
        showToastMessage('This competition has expired and can no longer be played.', 'error');
        await loadUserData(); // Refresh to update UI
        return;
      }

      // Warn if less than 1 minute remaining
      if (timeData.timeRemaining < 60) {
        const proceed = window.confirm(
          `⚠️ This competition expires in ${timeData.timeRemaining} seconds.\n\nDo you want to continue?`
        );
        if (!proceed) return;
      }

      // All checks passed - open game modal
      setSelectedCompetition(competition);
      setShowGameModal(true);
    } catch (error) {
      console.error('Error checking competition time:', error);
      showToastMessage('Failed to verify competition status. Please try again.', 'error');
    } finally {
      setLoading('checkingTime', false);
    }
  };

  /**
 * Handle leaving a competition
 */
  const handleLeaveCompetition = (competition) => {
    if (!competition) {
      showToastMessage('Invalid competition', 'error');
      return;
    }

    // Validate leave conditions
    if (competition.hasPlayed) {
      showToastMessage('Cannot leave after playing', 'warning');
      return;
    }

    if (competition.playedCount > 0) {
      showToastMessage('Cannot leave after someone has started playing', 'warning');
      return;
    }

    setPendingLeaveCompetition(competition);
    setShowLeaveConfirmModal(true);
  };

  /**
   * Confirm and execute leave competition
   */
  const confirmLeaveCompetition = async () => {
    if (!pendingLeaveCompetition) {
      showToastMessage('No competition selected', 'error');
      return;
    }

    try {
      setLoading('leaving', true);

      await leaveCompetition(pendingLeaveCompetition.code); // Use from GameContext

      showToastMessage(
        `Successfully left "${pendingLeaveCompetition.title}". Refund: KSh ${pendingLeaveCompetition.entryFee}`,
        'success'
      );

      // Refresh data
      await loadUserData();

      setShowLeaveConfirmModal(false);
      setPendingLeaveCompetition(null);
    } catch (error) {
      console.error('Error leaving competition:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading('leaving', false);
    }
  };

  const handleGameEnd = async (gameResults) => {
    if (!selectedCompetition) {
      showToastMessage('No competition selected', 'error');
      return;
    }

    if (!gameResults || typeof gameResults.score !== 'number') {
      showToastMessage('Invalid game results', 'error');
      setShowGameModal(false);
      setSelectedCompetition(null);
      return;
    }

    try {
      setLoading('submittingScore', true);

      const result = await submitScore(
        selectedCompetition.code,
        {
          score: gameResults.score
        }
      );

      let message = `Game completed! Score: ${gameResults.score}`;

      if (result.allCompleted) {
        message += ` 🎉 All players have finished!`;
      } else {
        message += ` (${result.playedCount}/${result.totalPlayers} players completed)`;
      }

      showToastMessage(message, 'success');

      await loadUserData();
    } catch (error) {
      console.error('Error submitting score:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading('submittingScore', false);
      setShowGameModal(false);
      setSelectedCompetition(null);
    }
  };


  const handleCopyCode = async (code) => {
    if (!code) {
      showToastMessage('No code to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToastMessage('Code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      showToastMessage('Failed to copy code', 'error');
    }
  };

  const handlePaymentSuccess = async () => {
    showToastMessage('Payment successful!', 'success');
    setShowPaymentModal(false);

    if (loadUserData) {
      await loadUserData();
    }

    if (selectedCompetition) {
      setShowGameModal(true);
    }
  };

  const openJoinModal = () => setShowJoinModal(true);

  const openInviteModal = (competition) => {
    if (!competition) {
      showToastMessage('Invalid competition', 'error');
      return;
    }

    if (competition.currentPlayers >= competition.maxPlayers) {
      showToastMessage('Competition is full', 'error');
      return;
    }

    if (competition.status === 'COMPLETED' || competition.status === 'CANCELED') {
      showToastMessage('Cannot invite to a completed competition', 'error');
      return;
    }

    setSelectedCompetition(competition);
    setShowInviteModal(true);
  };

  const openInvitesModal = () => {
    setShowInvitesModal(true);
    if (fetchPendingInvites) {
      fetchPendingInvites();
    }
  };

  const openFriendsModal = () => {
    setShowFriendsModal(true);
    if (fetchFriends) {
      fetchFriends();
    }
    if (fetchFriendRequests) {
      fetchFriendRequests();
    }
  };

  const openHistoryModal = () => setShowHistoryModal(true);

  return {
    modalStates: {
      showJoinModal,
      showInviteModal,
      showInvitesModal,
      showFriendsModal,
      showHistoryModal,
      showPaymentModal,
      showGameModal,
      selectedCompetition,
      showJoinConfirmModal,
      showAcceptConfirmModal,
      pendingJoinCompetition,
      pendingAcceptInvite,
      showLeaveConfirmModal,      // ADD THIS
      pendingLeaveCompetition
    },
    formStates: {
      joinCode,
      inviteUsername,
      friendRequestUsername
    },
    loadingStates, // FIXED: Don't wrap in object
    copiedCode,
    handleJoinByCode,
    handleInvitePlayer,
    handleAcceptInvite,
    handleDeclineInvite,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
    handlePlayClick,
    handleGameEnd,
    handleCopyCode,
    handlePaymentSuccess,
    handleLeaveCompetition,
    confirmLeaveCompetition,
    closeAllModals,
    setFormValue,
    openJoinModal,
    openInviteModal,
    openInvitesModal,
    openFriendsModal,
    openHistoryModal,
    confirmJoinByCode,
    confirmAcceptInvite,
    handleTopUpFromConfirm,
    setShowJoinConfirmModal,
    setShowAcceptConfirmModal,
    setShowLeaveConfirmModal
  };
};

export default useModalHandlers;