import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import profileService from '../services/profileService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load profile data when user is authenticated
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setStats(null);
      setAchievements([]);
      setGameHistory([]);
      setPreferences(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      
      // Set preferences if included in profile
      if (profileData.preferences) {
        setPreferences(profileData.preferences);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load user statistics
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const statsData = await profileService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [isAuthenticated]);

  // Load achievements
  const loadAchievements = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const achievementsData = await profileService.getAchievements();
      setAchievements(achievementsData);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    }
  }, [isAuthenticated]);

  // Load game history
  const loadGameHistory = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;

    try {
      const historyData = await profileService.getGameHistory(params);
      setGameHistory(historyData);
    } catch (err) {
      console.error('Failed to load game history:', err);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadStats();
      loadAchievements();
      loadGameHistory();
    }
  }, [isAuthenticated, loadProfile, loadStats, loadAchievements, loadGameHistory]);

  /**
   * Update profile
   */
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProfile = await profileService.updateProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update avatar
   */
  const updateAvatar = async (avatar) => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateAvatar(avatar);
      setProfile(prev => ({ ...prev, avatar: updatedProfile.avatar }));
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (passwordData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await profileService.updatePassword(passwordData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update preferences
   */
  const updatePreferences = async (newPreferences) => {
    try {
      setError(null);
      const updatedPreferences = await profileService.updatePreferences(newPreferences);
      setPreferences(updatedPreferences);
      
      // Update profile with new preferences
      if (profile) {
        setProfile({ ...profile, preferences: updatedPreferences });
      }
      
      return updatedPreferences;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Refresh all profile data
   */
  const refreshProfile = async () => {
    await Promise.all([
      loadProfile(),
      loadStats(),
      loadAchievements(),
      loadGameHistory()
    ]);
  };

  /**
   * Delete account
   */
  const deleteAccount = async (password) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await profileService.deleteAccount(password);
      
      // Clear all profile data
      setProfile(null);
      setStats(null);
      setAchievements([]);
      setGameHistory([]);
      setPreferences(null);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export user data
   */
  const exportData = async () => {
    try {
      setError(null);
      const data = await profileService.exportData();
      
      // Create and download file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gamearena-profile-${user?.username || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Get public profile
   */
  const getPublicProfile = async (username) => {
    try {
      setError(null);
      const publicProfile = await profileService.getPublicProfile(username);
      return publicProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    profile,
    stats,
    achievements,
    gameHistory,
    preferences,
    isLoading,
    error,
    updateProfile,
    updateAvatar,
    updatePassword,
    updatePreferences,
    refreshProfile,
    loadGameHistory,
    deleteAccount,
    exportData,
    getPublicProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};