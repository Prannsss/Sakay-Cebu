export interface User {
  id: string;
  email: string;
  phone?: string;
  password?: string; // In a real app, this would be hashed
  role: 'user' | 'provider' | 'admin';
  name: string;
}

export interface Provider extends User {
  role: 'provider';
  verified: boolean;
}

export interface Vehicle {
  id: string;
  providerId: string;
  model: string;
  type: 'Sedan' | 'SUV' | 'Motorcycle' | 'Van';
  location: string;
  pricePerDay: number;
  photos: string[]; // IDs from placeholder-images.json
  availability: { from: string; to: string }[];
  description: string;
  verified: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export interface VehicleFilterState {
  location: string;
  type: string;
}
