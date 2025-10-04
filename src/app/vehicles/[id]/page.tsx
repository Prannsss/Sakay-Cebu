'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Booking } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [bookings, setBookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  });

  const vehicle = vehicles.find(v => v.id === id);

  useEffect(() => {
    // Simulate loading to prevent hydration errors
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleBooking = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'You need to be logged in to book a vehicle.',
      });
      router.push('/login');
      return;
    }
    if (!date?.from || !date?.to || !vehicle) {
        toast({
            variant: 'destructive',
            title: 'Booking Failed',
            description: 'Please select valid booking dates.',
        });
        return;
    }

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      vehicleId: vehicle.id,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      startTime: '09:00',
      endTime: '18:00',
      totalPrice: differenceInDays(date.to, date.from) * vehicle.pricePerDay,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setBookings([...bookings, newBooking]);

    toast({
        title: 'Booking Confirmed!',
        description: `You have successfully booked the ${vehicle.model}.`,
    });
    router.push('/dashboard');
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!vehicle) {
    return <div className="text-center py-10">Vehicle not found.</div>;
  }

  const image = PlaceHolderImages.find(img => img.id === vehicle.photos[0]);
  const isBase64 = vehicle.photos[0]?.startsWith('data:image');
  const bookingDays = date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;
  const totalPrice = bookingDays * vehicle.pricePerDay;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                {isBase64 ? (
                    <img
                    src={vehicle.photos[0]}
                    alt={vehicle.model}
                    className="rounded-lg object-cover w-full aspect-video"
                    />
                ) : image ? (
                    <Image
                    src={image.imageUrl}
                    alt={vehicle.model}
                    width={1200}
                    height={800}
                    className="rounded-lg object-cover w-full aspect-video"
                    data-ai-hint={image.imageHint}
                    />
                ) : (
                    <div className="rounded-lg bg-muted w-full aspect-video flex items-center justify-center">
                        <span className="text-muted-foreground">No image available</span>
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <h1 className="text-4xl font-bold font-headline">{vehicle.model}</h1>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-md">{vehicle.type}</Badge>
                    <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{vehicle.location}</span>
                    </div>
                </div>
                <p className="text-lg text-muted-foreground">{vehicle.description}</p>
                <div className="text-3xl font-bold">
                    ₱{vehicle.pricePerDay.toLocaleString()}
                    <span className="text-lg font-normal text-muted-foreground">/day</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Select Booking Dates</CardTitle>
                    <CardDescription>Choose your rental period.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>A simulated payment confirmation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-medium">Selected Vehicle</p>
                        <p className="text-muted-foreground">{vehicle.model}</p>
                    </div>
                    <div>
                        <p className="font-medium">Rental Period</p>
                        <p className="text-muted-foreground">{bookingDays > 0 ? `${bookingDays} days` : 'Please select dates'}</p>
                    </div>
                    <div className="border-t pt-4">
                        <p className="font-medium text-lg">Total Price</p>
                        <p className="text-2xl font-bold">₱{totalPrice > 0 ? totalPrice.toLocaleString() : '0'}</p>
                    </div>
                    <Button onClick={handleBooking} className="w-full" size="lg" disabled={bookingDays <= 0}>Confirm Booking</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
