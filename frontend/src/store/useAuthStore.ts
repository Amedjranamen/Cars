import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const data = await authService.login(email, password);
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Erreur de connexion',
        loading: false 
      });
      throw error;
    }
  },

  register: async (email, password, full_name, phone) => {
    try {
      set({ loading: true, error: null });
      const data = await authService.register({ email, password, full_name, phone });
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Erreur d\'inscription',
        loading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      error: null 
    });
  },

  checkAuth: async () => {
    try {
      set({ loading: true });
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const user = await authService.getMe();
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        loading: false 
      });
    }
  },
}));
