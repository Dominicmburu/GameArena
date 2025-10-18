import api from '../utils/api';

class ProfileService {
  /**
   * Get current user's profile
   */
  async getProfile() {
    try {
      const { data } = await api.get('/profile/me');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch profile';
      throw new Error(msg);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const { data } = await api.put('/profile/me', profileData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(msg);
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(avatar) {
    try {
      const { data } = await api.patch('/profile/avatar', { avatar });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update avatar';
      throw new Error(msg);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(passwordData) {
    try {
      const { data } = await api.post('/profile/password', passwordData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update password';
      throw new Error(msg);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const { data } = await api.patch('/profile/preferences', preferences);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update preferences';
      throw new Error(msg);
    }
  }

  /**
   * Get user statistics
   */
  async getStats() {
    try {
      const { data } = await api.get('/profile/stats');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch statistics';
      throw new Error(msg);
    }
  }

  /**
   * Get user achievements
   */
  async getAchievements() {
    try {
      const { data } = await api.get('/profile/achievements');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch achievements';
      throw new Error(msg);
    }
  }

  /**
   * Get user game history
   */
  async getGameHistory(params = {}) {
    try {
      const { page = 1, limit = 20 } = params;
      const { data } = await api.get('/history/mine', {
        params: { page, limit }
      });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch game history';
      throw new Error(msg);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password) {
    try {
      const { data } = await api.delete('/profile/me', {
        data: { password }
      });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to delete account';
      throw new Error(msg);
    }
  }

  /**
   * Get public profile by username
   */
  async getPublicProfile(username) {
    try {
      const { data } = await api.get(`/profile/user/${username}`);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch public profile';
      throw new Error(msg);
    }
  }

  /**
   * Export user data
   */
  async exportData() {
    try {
      const { data } = await api.get('/profile/export');
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to export data';
      throw new Error(msg);
    }
  }
}

export default new ProfileService();