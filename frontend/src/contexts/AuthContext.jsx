import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Memoize checkAuthStatus to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const userData = await authService.getCurrentUser()
      
      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        return userData
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return null
      }
    } catch (error) {
      // Only log if it's not a 401 (which is expected when not logged in)
      if (error.response?.status !== 401) {
        console.error('Auth check failed:', error)
      }
      setUser(null)
      setIsAuthenticated(false)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      
      // Wait a brief moment for cookie/token to be set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Then get user data
      const userData = await checkAuthStatus()
      
      if (!userData) {
        throw new Error('Failed to retrieve user data after login')
      }
      
      return response
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setIsLoading(true)
      const response = await authService.signup(userData)
      
      // Wait a brief moment for cookie/token to be set
      // await new Promise(resolve => setTimeout(resolve, 100))
      
      // // Then get user data
      // const user = await checkAuthStatus()
      
      // if (!user) {
      //   throw new Error('Failed to retrieve user data after signup')
      // }
      
      return response
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Always clear local state, even if logout API call fails
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}