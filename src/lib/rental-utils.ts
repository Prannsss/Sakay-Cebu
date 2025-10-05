import { Rental } from './types';

/**
 * Check if a rental period conflicts with existing rentals for a vehicle
 */
export function hasRentalConflict(
  vehicleId: string,
  startDate: string,
  endDate: string,
  existingRentals: Rental[],
  excludeRentalId?: string
): boolean {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  return existingRentals.some((rental) => {
    // Skip if it's the same rental (for updates)
    if (excludeRentalId && rental.rentalId === excludeRentalId) {
      return false;
    }

    // Only check for same vehicle and non-rejected/completed rentals
    if (
      rental.vehicleId !== vehicleId ||
      rental.status === 'Rejected' ||
      rental.status === 'Completed'
    ) {
      return false;
    }

    const existingStart = new Date(rental.startDate);
    const existingEnd = new Date(rental.endDate);

    // Check for overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
}

/**
 * Get rentals for a specific client
 */
export function getClientRentals(clientId: string, rentals: Rental[]): Rental[] {
  return rentals.filter((rental) => rental.clientId === clientId);
}

/**
 * Get rentals for a specific vehicle
 */
export function getVehicleRentals(vehicleId: string, rentals: Rental[]): Rental[] {
  return rentals.filter((rental) => rental.vehicleId === vehicleId);
}

/**
 * Calculate total rental price based on days and daily rate
 */
export function calculateRentalPrice(
  startDate: string,
  endDate: string,
  pricePerDay: number
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1) * pricePerDay;
}

/**
 * Create a new rental
 */
export function createRental(
  vehicleId: string,
  clientId: string,
  startDate: string,
  endDate: string,
  totalPrice: number,
  notes?: string
): Rental {
  return {
    rentalId: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId,
    clientId,
    startDate,
    endDate,
    status: 'Pending',
    totalPrice,
    createdAt: new Date().toISOString(),
    notes,
  };
}

/**
 * Update rental status
 */
export function updateRentalStatus(
  rental: Rental,
  newStatus: Rental['status']
): Rental {
  return {
    ...rental,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get upcoming rentals for a client
 */
export function getUpcomingRentals(clientId: string, rentals: Rental[]): Rental[] {
  const now = new Date();
  return rentals.filter(
    (rental) =>
      rental.clientId === clientId &&
      new Date(rental.startDate) > now &&
      (rental.status === 'Pending' || rental.status === 'Approved')
  );
}

/**
 * Get active/ongoing rentals for a client
 */
export function getActiveRentals(clientId: string, rentals: Rental[]): Rental[] {
  const now = new Date();
  return rentals.filter(
    (rental) =>
      rental.clientId === clientId &&
      new Date(rental.startDate) <= now &&
      new Date(rental.endDate) >= now &&
      (rental.status === 'Ongoing' || rental.status === 'Approved')
  );
}

/**
 * Get past rentals for a client
 */
export function getPastRentals(clientId: string, rentals: Rental[]): Rental[] {
  const now = new Date();
  return rentals.filter(
    (rental) =>
      rental.clientId === clientId &&
      (new Date(rental.endDate) < now || rental.status === 'Completed')
  );
}

/**
 * Validate rental dates
 */
export function validateRentalDates(startDate: string, endDate: string): {
  valid: boolean;
  error?: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start < now) {
    return { valid: false, error: 'Start date cannot be in the past' };
  }

  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }

  const maxDays = 90; // Maximum rental period
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (days > maxDays) {
    return { valid: false, error: `Rental period cannot exceed ${maxDays} days` };
  }

  return { valid: true };
}
