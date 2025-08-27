// src/services/gameService.js
import api from '../utils/api'

export const gameService = {
  // Get all available games
  async getAvailableGames() {
    const response = await api.get('/games')
    return response.data
  },

  // Get game by ID
  async getGameById(gameId) {
    const response = await api.get(`/games/${gameId}`)
    return response.data
  },

  // Submit training score
  async submitTrainingScore(gameId, score, gameData = {}) {
    const response = await api.post(`/games/${gameId}/training-score`, {
      score,
      playTime: gameData.playTime || 0,
      gameData,
      isTraining: true
    })
    return response.data
  },

  // Get user's training progress
  async getTrainingProgress(gameId) {
    const response = await api.get(`/games/${gameId}/training-progress`)
    return response.data
  }
}

