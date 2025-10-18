import { useEffect } from 'react';

const useSocketEvents = ({
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
}) => {
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('Setting up socket event listeners...');

    // Socket event handlers
    const handleNewInvite = (data) => {
      addNotification(`New invitation from ${data.invite.inviter.username}`, 'info');
      fetchPendingInvites().catch(console.warn);
    };

    const handleInviteAccepted = (data) => {
      const username = data.acceptedBy?.username || 'Someone';
      addNotification(`${username} accepted your invitation!`, 'success');
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

    const handleFriendRequestDeclined = (data) => {
      addNotification(`${data.declinedBy.username} declined your friend request`, 'warning');
      fetchFriendRequests().catch(console.warn);
    };

    const handleCompetitionJoined = (data) => {
      addNotification(`${data.player} joined your competition "${data.competitionTitle}"`, 'info');
      loadUserData().catch(console.warn);
    };

    const handleScoreSubmitted = (data) => {
      addNotification(`${data.player} submitted a score of ${data.score} in "${data.competitionTitle}"`, 'info');
    };

    const handleLeaderboardUpdate = (data) => {
      console.log('Leaderboard updated:', data);
    };

    const handleCompetitionUpdate = (data) => {
      console.log('Competition updated:', data);
      loadUserData().catch(console.warn);
    };

    const handlePlayerLeft = (data) => {
      addNotification(`A player left ${data.competitionTitle || 'a competition'}`, 'warning');
      loadUserData().catch(console.warn);
    };

    const handleCompetitionExpired = (data) => {
      addNotification('A competition has expired', 'warning');
      loadUserData().catch(console.warn);
    };

    // Set up all event listeners
    const unsubscribers = [
      subscribe('new_invite', handleNewInvite),
      subscribe('invite_accepted', handleInviteAccepted),
      subscribe('invite_declined', handleInviteDeclined),
      subscribe('new_friend_request', handleNewFriendRequest),
      subscribe('friend_request_accepted', handleFriendRequestAccepted),
      subscribe('friend_request_declined', handleFriendRequestDeclined),
      subscribe('competition_joined', handleCompetitionJoined),
      subscribe('score_submitted', handleScoreSubmitted),
      subscribe('leaderboard:update', handleLeaderboardUpdate),
      subscribe('subscribed', (data) => {
        console.log('Successfully subscribed to:', data.competition);
      }),
      subscribe('error', (error) => {
        console.error('Socket error:', error);
        addNotification(error.message || 'Socket error occurred', 'error');
      }),
      subscribe('competition:update', handleCompetitionUpdate),
      subscribe('competition:player_left', handlePlayerLeft),
      subscribe('competition:expired', handleCompetitionExpired)
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
};

export default useSocketEvents;