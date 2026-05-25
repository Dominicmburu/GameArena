import api from '../utils/api'

class TrainingService {
  async createSession({ gameName, score, duration }) {
    try {
      const { data } = await api.post('/training/session', { gameName, score, duration })
      return data
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to save training session'
      throw new Error(msg)
    }
  }

  async getMySessions({ page = 1, limit = 20, gameName } = {}) {
    try {
      const params = { page, limit, ...(gameName ? { gameName } : {}) }
      const { data } = await api.get('/training/mine', { params })
      return Array.isArray(data) ? data : []
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch training sessions'
      throw new Error(msg)
    }
  }

  async getStats() {
    try {
      const { data } = await api.get('/training/stats')
      return Array.isArray(data) ? data : []
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch training stats'
      throw new Error(msg)
    }
  }
}

const trainingService = new TrainingService()
export default trainingService
