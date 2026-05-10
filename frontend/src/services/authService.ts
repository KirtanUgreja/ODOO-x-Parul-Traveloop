import { apiFetch } from './api';

export const authService = {
  async login(email: string, password: string) {
    try {
      return await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    return apiFetch('/auth/me');
  },

  async googleAuth(googleData: any) {
    return apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  },
};
