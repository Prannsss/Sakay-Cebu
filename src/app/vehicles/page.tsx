'use client';

import { useState } from 'react';
import VehicleFilters from "@/components/vehicles/VehicleFilters";
import VehicleList from "@/components/vehicles/VehicleList";
import { Separator } from "@/components/ui/separator";
import { type VehicleFilterState } from '@/lib/types';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function VehiclesPage() {
  const [filters, setFilters] = useState<VehicleFilterState>({
    location: '',
    type: 'all',
  });

  return (
    <div className="space-y-8">
      <main className="space-y-8">
        <VehicleFilters onFilterChange={setFilters} />
        <Separator />
        <VehicleList filters={filters} />
      </main>
    </div>
  );
}
