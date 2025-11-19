import api from './api';
import { Vehicle } from '../types';

export interface VehicleFilters {
  type?: 'vente' | 'location';
  category?: string;
  min_price?: number;
  max_price?: number;
  transmission?: 'auto' | 'manual';
  fuel?: string;
}

export const vehicleService = {
  async getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    const response = await api.get('/vehicles', { params: filters });
    return response.data;
  },

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    await api.put(`/vehicles/${id}`, data);
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
