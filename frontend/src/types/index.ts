export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  category: string;
  type: 'vente' | 'location' | 'both';
  price_sale?: number;
  price_per_day?: number;
  year: number;
  transmission: 'auto' | 'manual';
  fuel: string;
  mileage: number;
  description: string;
  images: string[];
  features: string[];
  available: boolean;
  created_at: string;
}

export interface Reservation {
  _id: string;
  user_id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  start_date: string;
  end_date: string;
  driver_license: string;
  id_document: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  total_price: number;
  created_at: string;
}

export interface Purchase {
  _id: string;
  user_id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
