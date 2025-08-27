// src/services/paymentService.js
import api from '../utils/api'

export const paymentService = {
  // Initiate M-Pesa payment
  async initiateDeposit(amount, phoneNumber) {
    const response = await api.post('/payments/deposit', {
      amount,
      phoneNumber,
      method: 'mpesa'
    })
    return response.data
  },

  // Check payment status
  async checkPaymentStatus(transactionId) {
    const response = await api.get(`/payments/status/${transactionId}`)
    return response.data
  },

  // Get user's payment history
  async getPaymentHistory(params = {}) {
    const response = await api.get('/payments/history', { params })
    return response.data
  },

  // Get wallet balance
  async getWalletBalance() {
    const response = await api.get('/payments/wallet')
    return response.data
  }
}

