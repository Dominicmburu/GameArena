import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import walletService from '../services/walletService'
import { useAuth } from './AuthContext'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setBalance(0)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await walletService.getBalance()
      setBalance(data.balance || 0)
      return data.balance
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setError(error.response?.data?.message || 'Failed to fetch balance')
      setBalance(0)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setTransactions([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await walletService.getTransactions()
      setTransactions(data.transactions || [])
      return data.transactions
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setError(error.response?.data?.message || 'Failed to fetch transactions')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Deposit funds
  const deposit = async (amount, phoneNumber) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await walletService.deposit(amount, phoneNumber)
      
      // Optionally refresh balance after successful deposit
      if (result.success) {
        await fetchBalance()
      }
      
      return result
    } catch (error) {
      console.error('Deposit failed:', error)
      setError(error.response?.data?.message || 'Deposit failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw funds
  const withdraw = async (amount, phoneNumber) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await walletService.withdraw(amount, phoneNumber)
      
      // Refresh balance after successful withdrawal
      if (result.success) {
        await fetchBalance()
      }
      
      return result
    } catch (error) {
      console.error('Withdrawal failed:', error)
      setError(error.response?.data?.message || 'Withdrawal failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Query STK push status
  const querySTKStatus = async (checkoutRequestId) => {
    try {
      const result = await walletService.querySTKStatus(checkoutRequestId)
      
      // Refresh balance if payment was successful
      if (result.success) {
        await fetchBalance()
      }
      
      return result
    } catch (error) {
      console.error('STK query failed:', error)
      throw error
    }
  }

  // Refresh wallet data (balance and transactions)
  const refreshWallet = useCallback(async () => {
    await Promise.all([
      fetchBalance(),
      fetchTransactions()
    ])
  }, [fetchBalance, fetchTransactions])

  // Auto-fetch balance when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance()
    } else {
      setBalance(0)
      setTransactions([])
    }
  }, [isAuthenticated, user, fetchBalance])

  const value = {
    balance,
    transactions,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
    deposit,
    withdraw,
    querySTKStatus,
    refreshWallet
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}