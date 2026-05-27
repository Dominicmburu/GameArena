import api from '../utils/api';

const buildError = (error, fallback) => {
  const data = error?.response?.data || {};
  const err = new Error(data.message || error.message || fallback);
  err.code = data.error;
  err.status = error?.response?.status;
  err.data = data;
  return err;
};

class AuthService {
  async signup(userData) {
    try {
      const { data } = await api.post('/auth/signup', userData);
      return data;
    } catch (error) {
      throw buildError(error, 'Signup failed');
    }
  }

  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      throw buildError(error, 'Login failed');
    }
  }

  async verifyEmail({ email, code }) {
    try {
      const { data } = await api.post('/auth/verify-email', { email, code });
      return data;
    } catch (error) {
      throw buildError(error, 'Verification failed');
    }
  }

  async resendVerification(email) {
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      return data;
    } catch (error) {
      throw buildError(error, 'Failed to resend code');
    }
  }

  async forgotPassword(email) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      throw buildError(error, 'Failed to send reset link');
    }
  }

  async resetPassword({ token, password }) {
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      return data;
    } catch (error) {
      throw buildError(error, 'Failed to reset password');
    }
  }

  async logout() {
    try {
      const { data } = await api.post('/auth/logout', { ok: true });
      return data;
    } catch (error) {
      throw buildError(error, 'Logout failed');
    }
  }

  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      if (error?.response?.status === 401) return null;
      throw buildError(error, 'Failed to get user info');
    }
  }

  async checkAuth() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }
}

export default new AuthService();
