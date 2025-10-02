"use client";

import React, { useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { initialVehicles } from '@/lib/data';
import { Vehicle, VehicleFilterState } from '@/lib/types';
import VehicleCard from './VehicleCard';
import { Skeleton } from '../ui/skeleton';

interface VehicleListProps {
  filters: VehicleFilterState;
}

const VehicleList = ({ filters }: VehicleListProps) => {
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to prevent hydration mismatch and show a loading state
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const verifiedVehicles = vehicles.filter(v => v.verified);
  
  const filteredVehicles = React.useMemo(() => 
    verifiedVehicles.filter(vehicle => {
      const locationMatch = !filters.location || vehicle.location.toLowerCase().includes(filters.location.toLowerCase());
      const typeMatch = filters.type === 'all' || vehicle.type === filters.type;
      return locationMatch && typeMatch;
    }),
    [filters, verifiedVehicles]
  );

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            ))}
      </div>
    );
  }

  if (filteredVehicles.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">No vehicles match your criteria. Try different filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredVehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList;
