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
  type: 'Cars' | 'Motorcycles' | 'Vans' | 'Trucks' | 'Multicab';
  location: string;
  pricePerDay: number;
  photos: string[]; // IDs from placeholder-images.json
  availability: { from: string; to: string }[];
  description: string;
  verified: boolean;
  status?: 'available' | 'unavailable' | 'maintenance' | 'deleted';
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  driverLicense?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  pickedUpAt?: string;
  returnedAt?: string;
}

export interface VehicleFilterState {
  location: string;
  type: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  lastActivity: string;
  vehicleId?: string; // Optional: if conversation is about a specific vehicle
}
