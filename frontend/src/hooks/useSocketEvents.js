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
      addNotification(
        `${data.player} left ${data.competitionTitle || 'the competition'}`,
        'warning'
      );
      loadUserData().catch(console.warn);
    };

    // === NEW COMPETITION LIFECYCLE HANDLERS ===

    const handleCompetitionExpired = (data) => {
      const refundMsg = data.refundAmount > 0
        ? ` Refunded ${data.refundAmount} coins.`
        : '';

      addNotification(
        `Competition "${data.competitionTitle}" expired. ${data.message}${refundMsg}`,
        'warning'
      );

      setTimeout(() => {
        loadUserData().catch(console.warn);
      }, 1000);
    };

    const handleCompetitionDeleted = (data) => {
      addNotification(
        `Competition was deleted - ${data.reason}`,
        'warning'
      );

      // Reload data to remove deleted competition
      setTimeout(() => {
        loadUserData().catch(console.warn);
      }, 1000);
    };

    const handleCompetitionCanceled = (data) => {
      addNotification(
        `Competition "${data.competitionCode}" canceled - ${data.message}`,
        'warning'
      );

      // Reload data to update competition status
      setTimeout(() => {
        loadUserData().catch(console.warn);
      }, 1000);
    };

    const handleCompetitionCompleted = (data) => {
      addNotification(
        `Competition "${data.competitionTitle || data.competitionCode}" completed! Check your results`,
        'success'
      );

      // Reload data to show final results
      setTimeout(() => {
        loadUserData().catch(console.warn);
      }, 1000);
    };

    const handleCompetitionStarted = (data) => {
      addNotification(
        `Competition "${data.competitionTitle}" has started! 🎮`,
        'info'
      );

      // Reload data to update status
      loadUserData().catch(console.warn);
    };

    const handleCompetitionStatusChanged = (data) => {
      console.log('Competition status changed:', data);

      if (data.message) {
        addNotification(data.message, 'info');
      }

      // Reload data to reflect status change
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
      subscribe('competition:update', handleCompetitionUpdate),
      subscribe('competition:player_left', handlePlayerLeft),

      subscribe('competition_expired', handleCompetitionExpired),
      subscribe('competition_deleted', handleCompetitionDeleted),
      subscribe('competition_canceled', handleCompetitionCanceled),
      subscribe('competition_completed', handleCompetitionCompleted),
      subscribe('competition_started', handleCompetitionStarted),
      subscribe('competition_status_changed', handleCompetitionStatusChanged),

      subscribe('subscribed', (data) => {
        console.log('Successfully subscribed to:', data.competition);
      }),
      subscribe('unsubscribed', (data) => {
        console.log('✓ Successfully unsubscribed from:', data.competition);
      }),
      subscribe('error', (error) => {
        console.error('Socket error:', error);
        addNotification(error.message || 'Socket error occurred', 'error');
      }),
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
      // addNotification(`Connection problem: ${socketError}`, 'error');
      addNotification(`Connection problem`, 'error');
    } else if (connected) {
      console.log('Socket connected successfully');
    }
  }, [connected, socketError]);
};

export default useSocketEvents;