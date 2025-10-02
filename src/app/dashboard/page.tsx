"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Booking, Vehicle } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
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

  const userBookings = bookings.filter(b => b.userId === user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {user.name}! Here are your rentals.</p>

      {userBookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
            {userBookings.map(booking => {
                const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                if (!vehicle) return null;
                const image = PlaceHolderImages.find(img => img.id === vehicle.photos[0]);
                return (
                    <Card key={booking.id}>
                        <CardHeader className='flex-row items-start gap-4'>
                            {image && <Image src={image.imageUrl} alt={vehicle.model} width={120} height={80} className='rounded-lg' />}
                            <div>
                                <CardTitle>{vehicle.model}</CardTitle>
                                <CardDescription>{vehicle.type} - {vehicle.location}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
                            <p><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
                            <p><strong>Total Price:</strong> ₱{booking.totalPrice.toLocaleString()}</p>
                            <p><strong>Status:</strong> <span className="font-semibold capitalize">{booking.status}</span></p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardHeader>
            <CardTitle>No Rentals Yet</CardTitle>
            <CardDescription>You haven&apos;t booked any vehicles. Start exploring!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Find a Vehicle</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
