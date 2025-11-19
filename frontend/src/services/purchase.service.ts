import api from './api';
import { Purchase } from '../types';

export interface CreatePurchaseData {
  vehicle_id: string;
  message?: string;
}

export const purchaseService = {
  async createPurchase(data: CreatePurchaseData): Promise<Purchase> {
    const response = await api.post('/purchases', data);
    return response.data;
  },

  async getMyPurchases(): Promise<Purchase[]> {
    const response = await api.get('/purchases/my');
    return response.data;
  },

  async getAllPurchases(): Promise<Purchase[]> {
    const response = await api.get('/purchases');
    return response.data;
  },
};
