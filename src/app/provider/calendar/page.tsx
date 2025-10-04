'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar as CalendarIcon, Car, User, Clock, MapPin, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Booking, User as UserType, Provider } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function ProviderCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [bookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [users] = useLocalStorage<UserType[]>('sakay-cebu-users', []);
  const [providers] = useLocalStorage<Provider[]>('sakay-cebu-providers', []);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get all users (combine users and providers)
  const allUsers = [...users, ...providers];

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

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    return providerBookings.filter((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Calendar navigation
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dayBookings = getBookingsForDate(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      days.push(
        <div
          key={day.toString()}
          className={`aspect-square lg:aspect-auto lg:min-h-[100px] border border-border p-1 sm:p-2 cursor-pointer transition-colors overflow-hidden ${
            !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-card hover:bg-muted/50'
          } ${isToday ? 'ring-2 ring-primary' : ''} ${isSelected ? 'bg-primary/10' : ''}`}
          onClick={() => setSelectedDate(cloneDay)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
              {formattedDate}
            </span>
            {dayBookings.length > 0 && (
              <Badge variant="secondary" className="text-xs h-4 sm:h-5 px-1">
                {dayBookings.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1 hidden lg:block">
            {dayBookings.slice(0, 2).map((booking) => {
              const vehicle = vehicles.find(v => v.id === booking.vehicleId);
              return (
                <div
                  key={booking.id}
                  className="text-xs p-1 bg-primary/20 rounded truncate"
                  title={vehicle?.model}
                >
                  {vehicle?.model}
                </div>
              );
            })}
            {dayBookings.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayBookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-px">
        {days}
      </div>
    );
    days = [];
  }

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-headline">Booking Calendar</h1>
        <p className="text-muted-foreground">Manage your vehicle bookings and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {providerBookings.length} total bookings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={today}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-px mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={day} className="text-center text-xs sm:text-sm font-semibold py-2 text-muted-foreground">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="space-y-px">
                {rows}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Date Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateBookings.map(booking => {
                      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                      const client = allUsers.find((u: UserType | Provider) => u.id === booking.userId);
                      return (
                        <Card key={booking.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold text-sm">{vehicle?.model}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{client?.name || 'Unknown Client'}</span>
                            </div>
                            {(booking.phone || client?.phone) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{booking.phone || client?.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{vehicle?.location}</span>
                            </div>
                            <Badge variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'active' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                            <div className="pt-2 border-t">
                              <p className="font-semibold text-primary">
                                ₱{booking.totalPrice.toLocaleString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No bookings for this date</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Click on a date to view bookings</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Bookings</span>
                <Badge variant="secondary">
                  {providerBookings.filter(b => b.status === 'active').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <Badge variant="outline">
                  {providerBookings.filter(b => b.status === 'cancelled').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <Badge variant="default">
                  {providerBookings.filter(b => b.status === 'completed').length}
                </Badge>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Revenue</span>
                  <span className="font-bold text-primary">
                    ₱{providerBookings
                      .filter(b => b.status === 'completed' || b.status === 'active')
                      .reduce((sum, b) => sum + b.totalPrice, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
