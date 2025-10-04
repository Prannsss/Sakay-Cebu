"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Loader2, Calendar, MapPin, Clock, X, CheckCircle, XCircle, Hourglass, Car } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Booking, Vehicle, User, Provider, Message, Conversation } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [users] = useLocalStorage<User[]>('sakay-cebu-users', []);
  const [providers] = useLocalStorage<Provider[]>('sakay-cebu-providers', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sakay-cebu-conversations', []);
  const [refreshKey, setRefreshKey] = useState(0);

  const allUsers = [...users, ...providers];

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleCancelRental = (booking: Booking) => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    if (!vehicle) return;

    // Update booking status to cancelled
    const updatedBookings = bookings.map((b: Booking) => {
      if (b.id === booking.id) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Find conversation with the provider
    const conversation = conversations.find((c: Conversation) =>
      c.participants.includes(user!.id) &&
      c.participants.includes(vehicle.providerId) &&
      c.vehicleId === booking.vehicleId
    );

    if (conversation) {
      // Send cancellation message to provider
      const messageContent = `I've cancelled my rental booking for ${vehicle.model} (${format(new Date(booking.startDate), 'MMM d')} - ${format(new Date(booking.endDate), 'MMM d')}). Thank you for your understanding.`;

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId: conversation.id,
        senderId: user!.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Save message to conversation storage
      const messagesKey = `sakay-cebu-messages-${conversation.id}`;
      const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]') as Message[];
      localStorage.setItem(messagesKey, JSON.stringify([...existingMessages, newMessage]));

      // Update conversation's last activity and last message
      const updatedConversations = conversations.map((c: Conversation) => {
        if (c.id === conversation.id) {
          return {
            ...c,
            lastActivity: newMessage.timestamp,
            lastMessage: newMessage,
          };
        }
        return c;
      });
      setConversations(updatedConversations);
    }

    setRefreshKey(prev => prev + 1);

    toast({
      title: 'Rental Cancelled',
      description: `Your booking for ${vehicle.model} has been cancelled.`,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userBookings = bookings.filter(b => b.userId === user.id);
  const pendingBookings = userBookings.filter(b => b.status === 'pending');
  const activeBookings = userBookings.filter(b => b.status === 'active');
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Hourglass className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'active': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderBookingCard = (booking: Booking) => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const provider = allUsers.find(u => u.id === vehicle?.providerId);
    if (!vehicle) return null;

    const isBase64 = vehicle.photos[0]?.startsWith('data:image');
    const photoUrl = isBase64 ? vehicle.photos[0] : undefined;

    return (
      <Card key={booking.id} className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Vehicle Image */}
          <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted relative">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={vehicle.model} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="flex-1">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{vehicle.model}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    {vehicle.location}
                  </CardDescription>
                  {provider && (
                    <CardDescription className="text-xs mt-1">
                      Provider: {provider.name}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={getStatusVariant(booking.status)} className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.startDate), 'MMM d, yyyy')}
                    </p>
                    {booking.startTime && (
                      <p className="text-xs text-muted-foreground">{booking.startTime}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Return</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.endDate), 'MMM d, yyyy')}
                    </p>
                    {booking.endTime && (
                      <p className="text-xs text-muted-foreground">{booking.endTime}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-2xl font-bold text-primary">₱{booking.totalPrice.toLocaleString()}</p>
              </div>

              {booking.status === 'pending' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Cancel Rental
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Rental?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your rental for {vehicle.model}? This action cannot be undone and the provider will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Rental</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancelRental(booking)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 left-0 top-0 bottom-0 lg:left-64 bg-background overflow-hidden">
      <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Rentals</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name}! Manage your vehicle rentals.
          </p>
        </div>

        {userBookings.length > 0 ? (
          <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-5 shrink-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
                <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{userBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending
                {pendingBookings.length > 0 && <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">{pendingBookings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">
                Active
                {activeBookings.length > 0 && <Badge variant="default" className="ml-1 sm:ml-2 text-xs">{activeBookings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Done
                {completedBookings.length > 0 && <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{completedBookings.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
                Cancel
                {cancelledBookings.length > 0 && <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs">{cancelledBookings.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-6 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {userBookings.map(booking => renderBookingCard(booking))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="pending" className="flex-1 mt-6 overflow-hidden">
              <ScrollArea className="h-full">
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Hourglass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending rentals</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {pendingBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="flex-1 mt-6 overflow-hidden">
              <ScrollArea className="h-full">
                {activeBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active rentals</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {activeBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="flex-1 mt-6 overflow-hidden">
              <ScrollArea className="h-full">
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed rentals</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {completedBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cancelled" className="flex-1 mt-6 overflow-hidden">
              <ScrollArea className="h-full">
                {cancelledBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No cancelled rentals</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {cancelledBookings.map(booking => renderBookingCard(booking))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <CardHeader>
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Rentals Yet</CardTitle>
              <CardDescription>You haven&apos;t booked any vehicles. Start exploring!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/vehicles">Find a Vehicle</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
