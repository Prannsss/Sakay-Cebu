'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import { Booking, Vehicle, User, Provider, Message, Conversation, Rental } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, CheckCircle, Clock, User as UserIcon, Phone, FileText, Send, CheckCheck, XCircle, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import { updateRentalStatus } from '@/lib/rental-utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const RentalRequestsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [rentals, setRentals] = useLocalStorage<Rental[]>('sakay-cebu-rentals', []);
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', []);
  const [users, setUsers] = useLocalStorage<User[]>('sakay-cebu-users', []);
  const [providers, setProviders] = useLocalStorage<Provider[]>('sakay-cebu-providers', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sakay-cebu-conversations', []);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionPrice, setExtensionPrice] = useState('');

  // Get all users (combine users and providers)
  const allUsers = [...users, ...providers];

  // Filter bookings for vehicles owned by this provider
  const myVehicleIds = vehicles.filter((v: Vehicle) => v.providerId === user?.id).map((v: Vehicle) => v.id);
  const pendingBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'pending');
  const activeBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'active');
  const completedBookings = bookings.filter((b: Booking) => myVehicleIds.includes(b.vehicleId) && b.status === 'completed');

  // Filter rentals for vehicles owned by this provider
  const myRentals = rentals.filter((r: Rental) => myVehicleIds.includes(r.vehicleId));
  const pendingRentals = myRentals.filter((r: Rental) => r.status === 'Pending');
  const approvedRentals = myRentals.filter((r: Rental) => r.status === 'Approved' || r.status === 'Ongoing');
  const completedRentals = myRentals.filter((r: Rental) => r.status === 'Completed');
  const rejectedRentals = myRentals.filter((r: Rental) => r.status === 'Rejected');

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

  const handleExtendRental = (booking: Booking) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === booking.vehicleId);
    if (!vehicle) return;

    setSelectedBooking(booking);
    setExtensionDate('');
    setExtensionPrice('');
    setIsExtensionModalOpen(true);
  };

  const handleSubmitExtension = () => {
    if (!selectedBooking || !extensionDate || !extensionPrice) {
      alert('Please fill in all fields');
      return;
    }

    const newEndDate = new Date(extensionDate);
    const currentEndDate = new Date(selectedBooking.endDate);

    if (newEndDate <= currentEndDate) {
      alert('Extension date must be after the current return date');
      return;
    }

    const vehicle = vehicles.find((v: Vehicle) => v.id === selectedBooking.vehicleId);
    if (!vehicle) return;

    const extensionDays = Math.ceil((newEndDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24));
    const additionalPrice = parseFloat(extensionPrice);
    const newTotalPrice = selectedBooking.totalPrice + additionalPrice;

    // Update booking with extended date and new price
    const updatedBookings = bookings.map((b: Booking) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          endDate: extensionDate,
          totalPrice: newTotalPrice,
          extendedAt: new Date().toISOString(),
          extensionDays,
        };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Find conversation with the client
    const conversation = conversations.find((c: Conversation) =>
      c.participants.includes(user!.id) &&
      c.participants.includes(selectedBooking.userId) &&
      c.vehicleId === selectedBooking.vehicleId
    );

    if (conversation) {
      // Create extension confirmation message
      const messageContent = `✅ RENTAL EXTENDED\n\nYour rental for ${vehicle.model} has been extended!\n\nNew Return Date: ${format(newEndDate, 'MMM d, yyyy')}\nExtension: +${extensionDays} day${extensionDays > 1 ? 's' : ''}\nAdditional Cost: ₱${additionalPrice.toLocaleString()}\nNew Total: ₱${newTotalPrice.toLocaleString()}\n\nThank you for choosing our service!`;

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId: conversation.id,
        senderId: user!.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Save message
      const messagesKey = `sakay-cebu-messages-${conversation.id}`;
      const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]') as Message[];
      localStorage.setItem(messagesKey, JSON.stringify([...existingMessages, newMessage]));

      // Update conversation
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

    setIsExtensionModalOpen(false);
    setSelectedBooking(null);
    setRefreshKey(prev => prev + 1);

    alert('Rental extended successfully!');
  };

  // Rental handling functions
  const handleRentalAction = (rental: Rental, action: 'approve' | 'reject') => {
    setSelectedRental(rental);
    setActionType(action);
    setShowActionDialog(true);
  };

  const confirmRentalAction = () => {
    if (!selectedRental || !actionType) return;

    const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
    const updatedRental = updateRentalStatus(selectedRental, newStatus);

    setRentals(rentals.map((r) => (r.rentalId === updatedRental.rentalId ? updatedRental : r)));

    alert(`Rental request has been ${actionType === 'approve' ? 'approved' : 'rejected'}.`);

    setShowActionDialog(false);
    setSelectedRental(null);
    setActionType(null);
    setRefreshKey(prev => prev + 1);
  };

  const renderRentalCard = (rental: Rental, showActions: boolean = false) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === rental.vehicleId);
    const client = allUsers.find((u: User | Provider) => u.id === rental.clientId);
    
    if (!vehicle || !client) return null;

    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const getStatusBadge = (status: Rental['status']) => {
      const variants: Record<Rental['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
        Pending: { variant: 'secondary', text: 'Pending' },
        Approved: { variant: 'default', text: 'Approved' },
        Rejected: { variant: 'destructive', text: 'Rejected' },
        Ongoing: { variant: 'default', text: 'Ongoing' },
        Completed: { variant: 'outline', text: 'Completed' },
      };
      const config = variants[status];
      return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    return (
      <Card key={rental.rentalId} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{vehicle.model}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <UserIcon className="h-4 w-4" />
                {client.name}
              </CardDescription>
            </div>
            {getStatusBadge(rental.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Client Contact */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {client.email}
            </div>

            {/* Rental Period */}
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              </span>
              <Badge variant="outline">{days} day{days > 1 ? 's' : ''}</Badge>
            </div>

            {/* Total Price */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>Total:</span>
              <span>₱{rental.totalPrice?.toLocaleString() || 0}</span>
            </div>

            {/* Notes */}
            {rental.notes && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Client Notes:</p>
                    <p className="text-muted-foreground">{rental.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleRentalAction(rental, 'approve')}
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRentalAction(rental, 'reject')}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
                <div className="space-y-2">
                  <Button
                    onClick={() => handleExtendRental(booking)}
                    variant="outline"
                    className="w-full"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Extend Rental
                  </Button>
                  <Button
                    onClick={() => handleMarkAsReturned(booking)}
                    className="w-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Returned
                  </Button>
                </div>
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
          <h1 className="text-3xl font-bold">Rental & Booking Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage your pending and active rental bookings and requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
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
          </TabsTrigger>
          <TabsTrigger value="rental-pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Rentals</span>
            {pendingRentals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRentals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rental-approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Approved</span>
            {approvedRentals.length > 0 && (
              <Badge variant="default" className="ml-1">
                {approvedRentals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rental-history" className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Rental Pending Tab */}
        <TabsContent value="rental-pending" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {pendingRentals.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending rental requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRentals.map((rental: Rental) => renderRentalCard(rental, true))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Rental Approved Tab */}
        <TabsContent value="rental-approved" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {approvedRentals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No approved rentals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedRentals.map((rental: Rental) => renderRentalCard(rental, false))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Rental History Tab */}
        <TabsContent value="rental-history" className="mt-6 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {[...completedRentals, ...rejectedRentals].length === 0 ? (
              <div className="text-center py-12">
                <CheckCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rental history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...completedRentals, ...rejectedRentals].map((rental: Rental) => renderRentalCard(rental, false))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

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

      {/* Confirmation Dialog for Rentals */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Rental Request' : 'Reject Rental Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this rental request? The client will be notified.'
                : 'Are you sure you want to reject this rental request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRentalAction}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extension Modal */}
      <Dialog open={isExtensionModalOpen} onOpenChange={setIsExtensionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Rental Period</DialogTitle>
            <DialogDescription>
              {selectedBooking && (() => {
                const vehicle = vehicles.find(v => v.id === selectedBooking.vehicleId);
                const client = allUsers.find(u => u.id === selectedBooking.userId);
                return vehicle ? `Extend rental for ${vehicle.model} - ${client?.name}` : '';
              })()}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted p-3 rounded-lg">
                <div>
                  <p className="font-medium text-muted-foreground">Current Return Date</p>
                  <p className="font-semibold mt-1">
                    {format(new Date(selectedBooking.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Current Total</p>
                  <p className="font-semibold mt-1">
                    ₱{selectedBooking.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extensionDate">New Return Date *</Label>
                <Input
                  id="extensionDate"
                  type="date"
                  value={extensionDate}
                  min={format(new Date(new Date(selectedBooking.endDate).getTime() + 86400000), 'yyyy-MM-dd')}
                  onChange={(e) => setExtensionDate(e.target.value)}
                />
                {extensionDate && (
                  <p className="text-xs text-muted-foreground">
                    +{Math.ceil((new Date(extensionDate).getTime() - new Date(selectedBooking.endDate).getTime()) / (1000 * 60 * 60 * 24))} additional day(s)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="extensionPrice">Additional Price (₱) *</Label>
                <Input
                  id="extensionPrice"
                  type="number"
                  placeholder="Enter additional cost"
                  value={extensionPrice}
                  onChange={(e) => setExtensionPrice(e.target.value)}
                  min="0"
                  step="100"
                />
                {extensionPrice && (
                  <p className="text-xs text-muted-foreground">
                    New Total: ₱{(selectedBooking.totalPrice + parseFloat(extensionPrice || '0')).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsExtensionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitExtension}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Extension
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default RentalRequestsPage;
