import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('localloop_user') || 'null'),
  token: localStorage.getItem('localloop_token'),
  isAuthenticated: !!localStorage.getItem('localloop_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.setItem('localloop_token', accessToken);
      localStorage.setItem('localloop_refresh', refreshToken);
      localStorage.setItem('localloop_user', JSON.stringify(user));

      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.setItem('localloop_token', accessToken);
      localStorage.setItem('localloop_refresh', refreshToken);
      localStorage.setItem('localloop_user', JSON.stringify(user));

      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('localloop_refresh');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('localloop_token');
      localStorage.removeItem('localloop_refresh');
      localStorage.removeItem('localloop_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('localloop_token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true });
      localStorage.setItem('localloop_user', JSON.stringify(res.data.data));
    } catch {
      // Handled by axios interceptor
    }
  },

  updateUser: (updated) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updated };
      localStorage.setItem('localloop_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
}));

