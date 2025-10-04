'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import { Booking, Vehicle, User, Provider, Message, Conversation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, CheckCircle, Clock, User as UserIcon, Phone, FileText, Send, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const RentalRequestsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', []);
  const [users, setUsers] = useLocalStorage<User[]>('sakay-cebu-users', []);
  const [providers, setProviders] = useLocalStorage<Provider[]>('sakay-cebu-providers', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sakay-cebu-conversations', []);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get all users (combine users and providers)
  const allUsers = [...users, ...providers];

  // Filter bookings for vehicles owned by this provider
  const myVehicleIds = vehicles.filter((v: Vehicle) => v.providerId === user?.id).map((v: Vehicle) => v.id);
  const pendingBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'pending');
  const activeBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'active');
  const completedBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'completed');

  const handleApprove = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    // Update booking status
    const updatedBookings = bookings.map((b: Booking) => {
      if (b.id === bookingId) {
        return { ...b, status: 'active' as const, approvedAt: new Date().toISOString() };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Mark vehicle as unavailable
    if (booking) {
      const updatedVehicles = vehicles.map((v: Vehicle) => {
        if (v.id === booking.vehicleId) {
          return { ...v, status: 'unavailable' as const };
        }
        return v;
      });
      setVehicles(updatedVehicles);
    }

    setRefreshKey(prev => prev + 1);
  };

  const handleReadyForPickup = (booking: Booking) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === booking.vehicleId);
    if (!vehicle) return;

    // Update booking to mark as picked up
    const updatedBookings = bookings.map((b: Booking) => {
      if (b.id === booking.id) {
        return { ...b, pickedUpAt: new Date().toISOString() };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Find or create conversation with the client
    let conversation = conversations.find((c: Conversation) =>
      c.participants.includes(user!.id) &&
      c.participants.includes(booking.userId) &&
      c.vehicleId === booking.vehicleId
    );

    if (!conversation) {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        participants: [user!.id, booking.userId],
        lastActivity: new Date().toISOString(),
        vehicleId: booking.vehicleId,
      };
      conversation = newConversation;
      setConversations([...conversations, newConversation]);
    }

    // Create the auto-message
    const pickupDate = format(new Date(booking.startDate), 'MMMM d, yyyy');
    const pickupTime = booking.startTime;
    const messageContent = `Your vehicle (${vehicle.model}) is ready for pickup on ${pickupDate} at ${pickupTime}. Looking forward to serving you!`;

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
      if (c.id === conversation!.id) {
        return {
          ...c,
          lastActivity: newMessage.timestamp,
          lastMessage: newMessage,
        };
      }
      return c;
    });

    if (!conversations.find((c: Conversation) => c.id === conversation!.id)) {
      updatedConversations.push({
        ...conversation,
        lastActivity: newMessage.timestamp,
        lastMessage: newMessage,
      });
    }

    setConversations(updatedConversations);
    setRefreshKey(prev => prev + 1);

    // Show success feedback
    alert('Pickup notification sent to client!');
  };

  const handleMarkAsReturned = (booking: Booking) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === booking.vehicleId);
    if (!vehicle) return;

    // Update booking to mark as completed/returned
    const updatedBookings = bookings.map((b: Booking) => {
      if (b.id === booking.id) {
        return { 
          ...b, 
          status: 'completed' as const, 
          returnedAt: new Date().toISOString() 
        };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Mark vehicle as available again
    const updatedVehicles = vehicles.map((v: Vehicle) => {
      if (v.id === booking.vehicleId) {
        return { ...v, status: 'available' as const };
      }
      return v;
    });
    setVehicles(updatedVehicles);

    // Find conversation with the client
    const conversation = conversations.find((c: Conversation) =>
      c.participants.includes(user!.id) &&
      c.participants.includes(booking.userId) &&
      c.vehicleId === booking.vehicleId
    );

    if (conversation) {
      // Create return confirmation message
      const returnDate = format(new Date(booking.endDate), 'MMMM d, yyyy');
      const messageContent = `Thank you for returning the ${vehicle.model}! We hope you enjoyed your rental experience. Looking forward to serving you again!`;

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

    // Show success feedback
    alert('Rental marked as completed! Thank you message sent to client.');
  };

  const renderBookingCard = (booking: Booking, isPending: boolean) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === booking.vehicleId);
    const client = allUsers.find((u: User | Provider) => u.id === booking.userId);

    if (!vehicle || !client) return null;

    return (
      <Card key={booking.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{vehicle.model}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <UserIcon className="h-4 w-4" />
                {client.name}
              </CardDescription>
            </div>
            <Badge variant={isPending ? 'secondary' : 'default'}>
              {isPending ? 'Pending' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Pickup</p>
                <p className="text-muted-foreground">
                  {format(new Date(booking.startDate), 'MMM d, yyyy')} at {booking.startTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Return</p>
                <p className="text-muted-foreground">
                  {format(new Date(booking.endDate), 'MMM d, yyyy')} at {booking.endTime}
                </p>
              </div>
            </div>
          </div>

          {booking.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{booking.phone}</span>
            </div>
          )}

          {booking.driverLicense && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>License: {booking.driverLicense}</span>
            </div>
          )}

          {booking.notes && (
            <div className="text-sm">
              <p className="font-medium mb-1">Notes:</p>
              <p className="text-muted-foreground">{booking.notes}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-lg font-semibold">₱{booking.totalPrice.toLocaleString()}</p>
          </div>

          {isPending ? (
            <Button
              onClick={() => handleApprove(booking.id)}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Request
            </Button>
          ) : (
            <>
              {!booking.pickedUpAt ? (
                <Button
                  onClick={() => handleReadyForPickup(booking)}
                  variant="outline"
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Ready for Pickup
                </Button>
              ) : (
                <Button
                  onClick={() => handleMarkAsReturned(booking)}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Returned
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user || user.role !== 'provider') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Access denied. Providers only.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 left-0 lg:left-64 bg-background overflow-hidden">
      <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Rental Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage your pending and active rental bookings
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pending</span>
            {pendingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Active</span>
            {activeBookings.length > 0 && (
              <Badge variant="default" className="ml-1">
                {activeBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
            {completedBookings.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {completedBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking: Booking) => renderBookingCard(booking, true))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="active" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {activeBookings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active rentals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking: Booking) => renderBookingCard(booking, false))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {completedBookings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed rentals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking: Booking) => {
                  const vehicle = vehicles.find((v: Vehicle) => v.id === booking.vehicleId);
                  const client = allUsers.find((u: User | Provider) => u.id === booking.userId);

                  if (!vehicle || !client) return null;

                  return (
                    <Card key={booking.id} className="mb-4">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{vehicle.model}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <UserIcon className="h-4 w-4" />
                              {client.name}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-muted-foreground">
                                {format(new Date(booking.startDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Return</p>
                              <p className="text-muted-foreground">
                                {format(new Date(booking.endDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {booking.returnedAt && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium">Returned on:</p>
                            <p>{format(new Date(booking.returnedAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <p className="text-lg font-semibold text-green-600">₱{booking.totalPrice.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default RentalRequestsPage;
