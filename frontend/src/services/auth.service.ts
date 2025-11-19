import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  },
};
