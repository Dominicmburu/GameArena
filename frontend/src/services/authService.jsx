import api from '../utils/api';

class AuthService {
  // Optional: if your backend exposes a CSRF endpoint, uncomment calls to this
  // async ensureCsrf() {
  //   try { await api.get('/auth/csrf'); } catch (_) {}
  // }

  async signup(userData) {
    try {
      // await this.ensureCsrf();
      const { data } = await api.post('/auth/signup', userData);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Signup failed';
      throw new Error(msg);
    }
  }

  async login(credentials) {
    try {
      // await this.ensureCsrf();
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Login failed';
      throw new Error(msg);
    }
  }

  async logout() {
    try {
      // await this.ensureCsrf();
      const { data } = await api.post('/auth/logout', { ok: true });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Logout failed';
      throw new Error(msg);
    }
  }

  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me');
      return data; // user object
    } catch (error) {
      if (error?.response?.status === 401) return null;
      const msg = error?.response?.data?.message || error.message || 'Failed to get user info';
      throw new Error(msg);
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
