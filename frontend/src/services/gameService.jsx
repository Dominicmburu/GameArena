import api from '../utils/api';

class GameService {
  async getAllGames(params = {}) {
    try {
      const { data } = await api.get('/games', { params });
      return data?.games ?? [];
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch games';
      throw new Error(msg);
    }
  }

  async getGameById(gameId) {
    try {
      const { data } = await api.get(`/games/${gameId}`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game details';
      throw new Error(msg);
    }
  }

  async getPopularGames(limit) {
    try {
      const { data } = await api.get('/games/popular', { params: { limit } });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch popular games';
      throw new Error(msg);
    }
  }

  async getGameTypes() {
    try {
      const { data } = await api.get('/games/types');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game types';
      throw new Error(msg);
    }
  }

  async getGameCompetitions(gameId, params = {}) {
    try {
      const { data } = await api.get(`/games/${gameId}/competitions`, { params });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game competitions';
      throw new Error(msg);
    }
  }

  async getGameStats(gameId) {
    try {
      const { data } = await api.get(`/games/${gameId}/stats`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game stats';
      throw new Error(msg);
    }
  }
}

class CompetitionService {
  // Public competitions (no auth required)
  async getPublicCompetitions(params = {}) {
    try {
      const { data } = await api.get('/competitions/public', { params });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch public competitions';
      throw new Error(msg);
    }
  }

  // My created competitions
  async getMyCompetitions() {
    try {
      const { data } = await api.get('/competitions/mine');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch your competitions';
      throw new Error(msg);
    }
  }

  // Competitions I've participated in (matches backend route)
  async getParticipatedCompetitions() {
    try {
      const { data } = await api.get('/competitions/participated-competitions');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch participated competitions';
      throw new Error(msg);
    }
  }

  // Competition management
  async createCompetition(competitionData) {
    try {
      const { data } = await api.post('/competitions/create', competitionData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to create competition';
      throw new Error(msg);
    }
  }

  async joinCompetitionByCode(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/join`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to join competition';
      throw new Error(msg);
    }
  }
  
  async getCompetitionByCode(code) {
    try {
      const { data } = await api.get(`/competitions/${encodeURIComponent(code)}`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch competition details';
      throw new Error(msg);
    }
  }

  // Score submission
  async submitScore(code, scoreData) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/score`, scoreData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to submit score';
      throw new Error(msg);
    }
  }

  // Complete competition
  async completeCompetition(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/complete`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to complete competition';
      throw new Error(msg);
    }
  }

  // Global leaderboard
  async getGlobalLeaderboard(limit = 10) {
    try {
      const { data } = await api.get('/competitions/leaderboard', { params: { limit } });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch global leaderboard';
      throw new Error(msg);
    }
  }

  // Invites
  async getPendingInvites() {
    try {
      const { data } = await api.get('/competitions/invites');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch pending invites';
      throw new Error(msg);
    }
  }

  async getSentInvites() {
    try {
      const { data } = await api.get('/competitions/invites/sent');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch sent invites';
      throw new Error(msg);
    }
  }

  async invitePlayerByUsername(inviteData) {
    try {
      const { data } = await api.post('/competitions/invite', inviteData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to invite player';
      throw new Error(msg);
    }
  }

  async acceptInvite(inviteId) {
    try {
      const { data } = await api.post(`/competitions/invites/${inviteId}/accept`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to accept invite';
      throw new Error(msg);
    }
  }

  async declineInvite(inviteId) {
    try {
      const { data } = await api.post(`/competitions/invites/${inviteId}/decline`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to decline invite';
      throw new Error(msg);
    }
  }


  // Friends system
  async getFriends() {
    try {
      const { data } = await api.get('/competitions/friends');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch friends';
      throw new Error(msg);
    }
  }

  async getFriendRequests() {
    try {
      const { data } = await api.get('/competitions/friend-requests');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch friend requests';
      throw new Error(msg);
    }
  }

  async sendFriendRequest(requestData) {
    try {
      const { data } = await api.post('/competitions/friend-requests', requestData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to send friend request';
      throw new Error(msg);
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      const { data } = await api.post(`/competitions/friend-requests/${requestId}/accept`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to accept friend request';
      throw new Error(msg);
    }
  }

  async declineFriendRequest(requestId) {
    try {
      const { data } = await api.post(`/competitions/friend-requests/${requestId}/decline`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to decline friend request';
      throw new Error(msg);
    }
  }

  // Game history
  async getGameHistory() {
    try {
      const { data } = await api.get('/competitions/game-history');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game history';
      throw new Error(msg);
    }
  }

  // NEW: Leave competition
  async leaveCompetition(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/leave`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to leave competition';
      throw new Error(msg);
    }
  }

  // NEW: Get time remaining
  async getTimeRemaining(code) {
    try {
      const { data } = await api.get(`/competitions/${encodeURIComponent(code)}/time`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to get time remaining';
      throw new Error(msg);
    }
  }
}

export const gameService = new GameService();
export const competitionService = new CompetitionService();