import type { User, Provider, Vehicle } from './types';

export const initialUsers: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@example.com', password: 'adminpass', role: 'admin' },
];

export const initialProviders: Provider[] = [];

export const initialVehicles: Vehicle[] = [];

// Combined users array for messaging system
export const allUsers: User[] = [
  ...initialUsers,
  ...initialProviders,
];
