"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type VehicleFilterState } from '@/lib/types';

interface VehicleFiltersProps {
    onFilterChange: (filters: VehicleFilterState) => void;
}

const VehicleFilters = ({ onFilterChange }: VehicleFiltersProps) => {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('all');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ location, type });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Find Your Perfect Ride</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 items-end">
                <div className="md:col-span-1 lg:col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                    <Input id="location" placeholder="e.g., Cebu City, Mactan" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-muted-foreground mb-1">Vehicle Type</label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Search Vehicles
                </Button>
            </form>
        </CardContent>
    </Card>
  );
};

export default VehicleFilters;
