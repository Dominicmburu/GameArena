import { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const useModalHandlers = ({ loadUserData, showToastMessage, fetchPendingInvites, fetchSentInvites, fetchFriends, fetchFriendRequests, walletBalance }) => {
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

  const {
    joinCompetitionByCode,
    invitePlayerByUsername,
    acceptInvite,
    declineInvite,
    submitScore,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest
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

  // Enhanced error message mapper
  const getErrorMessage = (error) => {
    const errorMap = {
      // Competition errors
      'NOT_FOUND': 'Competition not found',
      'COMPETITION_ENDED': 'This competition has ended',
      'FULL': 'Competition is full',
      'INSUFFICIENT_FUNDS': 'Insufficient wallet balance. Please top up your wallet.',
      'ALREADY_JOINED': 'You are already in this competition',
      
      // Invite errors
      'FORBIDDEN': 'You do not have permission to perform this action',
      'USER_NOT_FOUND': 'User not found',
      'SELF_INVITE': 'You cannot invite yourself',
      'INVITE_EXISTS': 'This user has already been invited',
      'INVITE_NOT_FOUND': 'Invitation not found or expired',
      'ALREADY_ACCEPTED': 'This invitation has already been accepted',
      
      // Friend request errors
      'SELF_REQUEST': 'You cannot send a friend request to yourself',
      'ALREADY_FRIENDS': 'You are already friends with this user',
      'REQUEST_EXISTS': 'Friend request already exists',
      'INVALID_STATUS': 'This request has already been processed',
      
      // Game errors
      'NOT_JOINED': 'You are not a participant in this competition',
      'INVALID_PLAY_TIME': 'Invalid play time detected',
      
      // Validation errors
      'GAME_NOT_FOUND': 'Game not found',
      'ENTRY_FEE_BELOW_MIN': 'Entry fee is below minimum requirement',
      'EXCEEDS_MAX_PLAYERS': 'Player limit exceeds game maximum',
      'BELOW_MIN_PLAYERS': 'Player count is below game minimum',
      'INVALID_PLAY_TIME': 'Play time outside allowed range'
    };

    // If error has a response with error code
    if (error.response?.data?.error) {
      const errorCode = error.response.data.error;
      return errorMap[errorCode] || error.response.data.message || 'An error occurred';
    }

    // If error has a message
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

    // Validate code format (alphanumeric, typically 6-8 characters)
    const codePattern = /^[A-Z0-9]{4,10}$/i;
    if (!codePattern.test(joinCode.trim())) {
      showToastMessage('Invalid competition code format', 'error');
      return;
    }

    try {
      setLoading('joiningByCode', true);
      const result = await joinCompetitionByCode(joinCode.trim().toUpperCase());
      
      if (result.alreadyJoined) {
        showToastMessage('You are already in this competition', 'info');
        setShowJoinModal(false);
        setJoinCode('');
        return;
      }

      showToastMessage(
        `Successfully joined! Players: ${result.currentPlayers}/${result.maxPlayers}`,
        'success'
      );
      
      await loadUserData();
      setShowJoinModal(false);
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

    // Validate username format (basic check)
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(inviteUsername.trim())) {
      showToastMessage('Invalid username format', 'error');
      return;
    }

    // Check if competition is full
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
      
      // Refresh sent invites list
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

  const handleAcceptInvite = async (inviteId) => {
    if (!inviteId) {
      showToastMessage('Invalid invitation', 'error');
      return;
    }

    try {
      setLoading(`acceptingInvite_${inviteId}`, true);
      const result = await acceptInvite(inviteId);
      
      showToastMessage(
        `Invitation accepted! Prize pool increased by ${result.poolIncrement} cents`,
        'success'
      );
      
      await loadUserData();
      
      // Refresh invites list
      if (fetchPendingInvites) {
        await fetchPendingInvites();
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      const errorMessage = getErrorMessage(error);
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(`acceptingInvite_${inviteId}`, false);
    }
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
      
      // Refresh invites list
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

    // Validate username format
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
      
      // Refresh both friends and friend requests
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

  const handlePlayClick = (competition) => {
    if (!competition) {
      showToastMessage('Invalid competition', 'error');
      return;
    }

    // Check if competition is still ongoing
    if (competition.status === 'COMPLETED' || competition.status === 'CANCELED') {
      showToastMessage('This competition has ended', 'error');
      return;
    }

    // Check if user has already played
    if (competition.hasPlayed) {
      showToastMessage('You have already played this competition', 'info');
      return;
    }

    // Check wallet balance
    if (walletBalance >= competition.entryFee) {
      setSelectedCompetition(competition);
      setShowGameModal(true);
    } else {
      const shortfall = competition.entryFee - walletBalance;
      showToastMessage(
        `Insufficient balance. You need ${shortfall} more cents.`,
        'error'
      );
      setSelectedCompetition(competition);
      setShowPaymentModal(true);
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
      
      const result = await submitScore({
        competitionCode: selectedCompetition.code,
        score: gameResults.score,
        playTime: gameResults.playTime
      });

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
    
    // Reload user data to get updated wallet balance
    if (loadUserData) {
      await loadUserData();
    }

    // Open game modal if competition is selected
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

    // Check if competition is full
    if (competition.currentPlayers >= competition.maxPlayers) {
      showToastMessage('Competition is full', 'error');
      return;
    }

    // Check if competition has ended
    if (competition.status === 'COMPLETED' || competition.status === 'CANCELED') {
      showToastMessage('Cannot invite to a completed competition', 'error');
      return;
    }

    setSelectedCompetition(competition);
    setShowInviteModal(true);
  };

  const openInvitesModal = () => {
    setShowInvitesModal(true);
    // Refresh invites when modal opens
    if (fetchPendingInvites) {
      fetchPendingInvites();
    }
  };

  const openFriendsModal = () => {
    setShowFriendsModal(true);
    // Refresh friends and requests when modal opens
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
      selectedCompetition
    },
    formStates: {
      joinCode,
      inviteUsername,
      friendRequestUsername
    },
    loadingStates: {
      loadingStates
    },
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
    closeAllModals,
    setFormValue,
    openJoinModal,
    openInviteModal,
    openInvitesModal,
    openFriendsModal,
    openHistoryModal
  };
};

export default useModalHandlers;