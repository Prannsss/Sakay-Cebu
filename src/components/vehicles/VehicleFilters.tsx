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
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
                    <Input id="location" placeholder="Search by model or location..." value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="w-full md:w-48">
                    <label htmlFor="type" className="block text-sm font-medium text-muted-foreground mb-1">Vehicle Type</label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Cars">Cars</SelectItem>
                            <SelectItem value="Motorcycles">Motorcycles</SelectItem>
                            <SelectItem value="Vans">Vans</SelectItem>
                            <SelectItem value="Trucks">Trucks</SelectItem>
                            <SelectItem value="Multicab">Multicab</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </form>
        </CardContent>
    </Card>
  );
};

export default VehicleFilters;
