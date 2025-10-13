import { useCallback } from 'react';

const useDataLoader = ({
  fetchMyCompetitions,
  fetchParticipatedCompetitions,
  fetchGlobalLeaderboard,
  fetchFriends,
  fetchFriendRequests,
  fetchGameHistory,
  fetchPendingInvites,
  fetchSentInvites,
  setWalletBalance,
  setLeaderboard,
  showToastMessage
}) => {
  const loadWalletBalance = useCallback(async () => {
    try {
      setWalletBalance(1500);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  }, [setWalletBalance]);

  const loadGlobalLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await fetchGlobalLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  }, [fetchGlobalLeaderboard, setLeaderboard]);

  const loadUserData = useCallback(async () => {
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
  }, [
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    loadWalletBalance,
    loadGlobalLeaderboard,
    fetchFriends,
    fetchFriendRequests,
    fetchGameHistory,
    fetchPendingInvites,
    fetchSentInvites,
    showToastMessage
  ]);

  return { loadUserData, loadWalletBalance, loadGlobalLeaderboard };
};

export default useDataLoader;