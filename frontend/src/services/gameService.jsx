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
  async getPublicCompetitions(params = {}) {
    try {
      const { data } = await api.get('/competitions/public', { params });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch competitions';
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

  async getMyCompetitions() {
    try {
      const { data } = await api.get('/competitions/mine');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch your competitions';
      throw new Error(msg);
    }
  }

  async getParticipatedCompetitions() {
    try {
      const { data } = await api.get('/competitions/participated-competitions');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch participated competitions';
      throw new Error(msg);
    }
  }

  async createCompetition(competitionData) {
    try {
      const { data } = await api.post('/competitions/create', competitionData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to create competition';
      throw new Error(msg);
    }
  }

  async joinCompetition(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/join`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to join competition';
      throw new Error(msg);
    }
  }

  async markPlayerReady(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/ready`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to mark as ready';
      throw new Error(msg);
    }
  }

  async submitScore(code, score) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/score`, { score });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to submit score';
      throw new Error(msg);
    }
  }

  async completeCompetition(code) {
    try {
      const { data } = await api.post(`/competitions/${encodeURIComponent(code)}/complete`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to complete competition';
      throw new Error(msg);
    }
  }
}

export const gameService = new GameService();
export const competitionService = new CompetitionService();
