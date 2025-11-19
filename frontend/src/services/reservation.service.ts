import api from './api';
import { Reservation } from '../types';

export interface CreateReservationData {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  driver_license: string;
  id_document: string;
}

export const reservationService = {
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  async getMyReservations(): Promise<Reservation[]> {
    const response = await api.get('/reservations/my');
    return response.data;
  },

  async getAllReservations(): Promise<Reservation[]> {
    const response = await api.get('/reservations');
    return response.data;
  },

  async updateReservationStatus(id: string, status: string): Promise<void> {
    await api.patch(`/reservations/${id}/status`, null, { params: { status } });
  },
};
