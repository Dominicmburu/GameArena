import api from '../utils/api'

export const competitionService = {
  async getCompetitions(params = {}) {
    const response = await api.get('/competitions', { params })
    return response.data
  },

  async getUserCompetitions() {
    const response = await api.get('/competitions/my-competitions')
    return response.data
  },

  async createCompetition(competitionData) {
    const response = await api.post('/competitions', competitionData)
    return response.data
  },

  async joinCompetition(competitionId) {
    const response = await api.post(`/competitions/${competitionId}/join`)
    return response.data
  },

  async updateScore(competitionId, score, gameData = {}) {
    const response = await api.post(`/competitions/${competitionId}/score`, {
      score,
      playTime: gameData.playTime || 0,
      gameData
    })
    return response.data
  },

  async getLeaderboard(competitionId) {
    const response = await api.get(`/competitions/${competitionId}/leaderboard`)
    return response.data
  },

  async submitResults(competitionId, results) {
    const response = await api.post(`/competitions/${competitionId}/results`, results)
    return response.data
  },

  async getCompetitionByShareId(shareId) {
    const response = await api.get(`/competitions/share/${shareId}`)
    return response.data
  }
}

