import api from '../utils/api';

const walletService = {
  // Get wallet balance
  getBalance: async () => {
    try {
      const response = await api.get('/wallet/balance')
      return response.data
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error)
      throw error
    }
  },

  // Get transaction history
  getTransactions: async () => {
    try {
      const response = await api.get('/wallet/transactions')
      return response.data
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      throw error
    }
  },

  // Deposit funds
  deposit: async (amount, phoneNumber) => {
    try {
      const response = await api.post('/wallet/deposit', {
        amount,
        phone: phoneNumber
      })
      return response.data
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error
    }
  },

  // Withdraw funds
  withdraw: async (amount, phoneNumber) => {
    try {
      const response = await api.post('/wallet/withdraw', {
        amount,
        phone: phoneNumber
      })
      return response.data
    } catch (error) {
      console.error('Withdrawal failed:', error)
      throw error
    }
  },

  // Query STK push status
  querySTKStatus: async (checkoutRequestId) => {
    try {
      const response = await api.get(`/wallet/deposit/status/${checkoutRequestId}`)
      return response.data
    } catch (error) {
      console.error('STK query failed:', error)
      throw error
    }
  }
}

export default walletService