'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, PlusCircle, Car, Eye, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Booking } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [bookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'provider') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const providerVehicles = vehicles.filter(v => v.providerId === user.id);
  const providerBookings = bookings.filter(booking => 
    providerVehicles.some(vehicle => vehicle.id === booking.vehicleId)
  );

  // Analytics calculations
  const totalEarnings = providerBookings
    .filter(booking => booking.status === 'active' || booking.status === 'completed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  const activeBookings = providerBookings.filter(booking => 
    booking.status === 'active'
  ).length;
  
  const totalViews = providerVehicles.length * 150; // Mock views data
  const verifiedVehicles = providerVehicles.filter(vehicle => vehicle.verified).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-headline">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your vehicles and track your business performance</p>
        </div>
        {/* Desktop Add Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Button asChild>
            <Link href="/provider/add-vehicle">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Link 
        href="/provider/add-vehicle"
        className="lg:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110"
      >
        <PlusCircle className="h-6 w-6" />
      </Link>

      {/* Container with mobile flex ordering */}
      <div className="flex flex-col space-y-6">
        {/* Analytics Cards - Shows first on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 order-1 lg:order-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">₱{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {providerBookings.length} bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently rented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{providerVehicles.length}</div>
            <p className="text-xs text-muted-foreground">{verifiedVehicles} verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Vehicle impressions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings - Shows second on mobile */}
      {providerBookings.length > 0 && (
        <Card className="order-2 lg:order-2">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest rental requests and active bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerBookings.slice(0, 5).map(booking => {
                    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{vehicle?.model || 'Unknown'}</TableCell>
                        <TableCell>Customer #{booking.userId.slice(-4)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₱{booking.totalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'active' ? 'success' :
                            'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Management - Shows third on mobile */}
      {providerVehicles.length > 0 ? (
        <Card className="order-3 lg:order-3">
          <CardHeader>
            <CardTitle>My Vehicles</CardTitle>
            <CardDescription>Manage your vehicle listings and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerVehicles.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.model}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.location}</TableCell>
                      <TableCell>₱{vehicle.pricePerDay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.verified ? 'success' : 'secondary'}>
                          {vehicle.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center order-3 lg:order-3">
          <CardHeader>
            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Vehicles Listed</CardTitle>
            <CardDescription>You haven&apos;t added any vehicles yet. List your first vehicle to start earning!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/provider/add-vehicle">Add Your First Vehicle</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Only Analytics now */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 order-4 lg:order-4">
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle className="text-lg mb-2">Analytics</CardTitle>
            <CardDescription className="text-center mb-4">View detailed performance metrics</CardDescription>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
