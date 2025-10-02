'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, PlusCircle, Car } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your vehicle listings.</p>
        </div>
        <Button asChild>
            <Link href="/provider/add-vehicle">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
            </Link>
        </Button>
      </div>

      {providerVehicles.length > 0 ? (
        <Card>
            <CardHeader>
                <CardTitle>My Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
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
                                    <Badge variant={vehicle.verified ? 'success' : 'destructive'}>
                                        {vehicle.verified ? 'Verified' : 'Pending'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
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
    </div>
  );
}
