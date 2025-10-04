'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Car, Bike, Truck, MapPin, Star, Search, Calendar, Clock, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, User as UserType, Message, Conversation, Booking } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [rentalForm, setRentalForm] = useState({
    pickupDate: '',
    returnDate: '',
    pickupTime: '',
    returnTime: '',
    driverLicense: '',
    phoneNumber: '',
    notes: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [providers] = useLocalStorage<UserType[]>('sakay-cebu-providers', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sakay-cebu-conversations', []);
  const [bookings, setBookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);

  const filteredVehicles = vehicles.filter(vehicle => {
    // Filter out deleted vehicles
    if (vehicle.status === 'deleted') return false;
    
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || vehicle.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const getProvider = (providerId: string) => {
    return providers.find(p => p.id === providerId);
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
    setShowMessaging(false);
  };

  const handleSendMessage = () => {
    if (!user || !selectedVehicle || !currentMessage.trim()) return;

    const provider = getProvider(selectedVehicle.providerId);
    if (!provider) return;

    // Find or create conversation
    let conversation = conversations.find(c => 
      c.vehicleId === selectedVehicle.id &&
      c.participants.includes(user.id) &&
      c.participants.includes(provider.id)
    );

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation?.id || `conv-${Date.now()}`,
      senderId: user.id,
      content: currentMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (!conversation) {
      conversation = {
        id: newMessage.conversationId,
        participants: [user.id, provider.id],
        lastMessage: newMessage,
        lastActivity: newMessage.timestamp,
        vehicleId: selectedVehicle.id
      };
      setConversations([...conversations, conversation]);
    } else {
      const updatedConversations = conversations.map(c => 
        c.id === conversation!.id 
          ? { ...c, lastMessage: newMessage, lastActivity: newMessage.timestamp }
          : c
      );
      setConversations(updatedConversations);
    }

    // Store message
    const messagesKey = `sakay-cebu-messages-${conversation.id}`;
    const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
    localStorage.setItem(messagesKey, JSON.stringify([...existingMessages, newMessage]));

    setCurrentMessage('');
    toast({
      title: 'Message Sent!',
      description: 'The provider will receive your message.',
    });
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    const messagesKey = `sakay-cebu-messages-${conversationId}`;
    return JSON.parse(localStorage.getItem(messagesKey) || '[]');
  };

  const handleRentNow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsRentalModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleRentalSubmit = () => {
    if (!selectedVehicle || !user) return;
    
    // Basic validation
    if (!rentalForm.pickupDate || !rentalForm.returnDate || !rentalForm.driverLicense || !rentalForm.phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    // Validate times
    if (!rentalForm.pickupTime || !rentalForm.returnTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select pickup and return times.',
      });
      return;
    }

    // Calculate rental days
    const pickup = new Date(rentalForm.pickupDate);
    const returnDate = new Date(rentalForm.returnDate);
    const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 3600 * 24));
    
    if (days <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Dates',
        description: 'Return date must be after pickup date.',
      });
      return;
    }

    const totalCost = selectedVehicle.pricePerDay * days;

    // Create booking
    const newBooking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      vehicleId: selectedVehicle.id,
      startDate: rentalForm.pickupDate,
      endDate: rentalForm.returnDate,
      startTime: rentalForm.pickupTime,
      endTime: rentalForm.returnTime,
      totalPrice: totalCost,
      status: 'pending',
      driverLicense: rentalForm.driverLicense,
      phone: rentalForm.phoneNumber,
      notes: rentalForm.notes,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    setBookings([...bookings, newBooking]);

    toast({
      title: 'Rental Request Submitted!',
      description: `Your rental request for ${selectedVehicle.model} has been submitted. Total cost: ₱${totalCost.toLocaleString()} for ${days} day(s). The provider will review your request.`,
    });

    // Reset form and close modal
    setRentalForm({
      pickupDate: '',
      returnDate: '',
      pickupTime: '',
      returnTime: '',
      driverLicense: '',
      phoneNumber: '',
      notes: ''
    });
    setIsRentalModalOpen(false);
    setSelectedVehicle(null);
  };

  const calculateTotal = () => {
    if (!rentalForm.pickupDate || !rentalForm.returnDate || !selectedVehicle) return 0;
    
    const pickup = new Date(rentalForm.pickupDate);
    const returnDate = new Date(rentalForm.returnDate);
    const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 3600 * 24));
    
    return days > 0 ? selectedVehicle.pricePerDay * days : 0;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Vehicles</h1>
        </div>
        <p className="text-muted-foreground">
          Discover a wide range of vehicles available for rent in Cebu. 
          From motorcycles to cars and trucks, find the perfect ride for your needs.
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search Bar - Full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Dropdowns - Stack on mobile */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="cebu city">Cebu City</SelectItem>
                <SelectItem value="mandaue">Mandaue City</SelectItem>
                <SelectItem value="lapu-lapu">Lapu-Lapu City</SelectItem>
                <SelectItem value="talisay">Talisay City</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle Type" />
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
        </div>
      </Card>

      {/* Vehicle Listings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            Available Vehicles ({filteredVehicles.length})
          </h2>
          {(searchTerm || locationFilter !== 'all' || typeFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No vehicles found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle) => {
              const isBase64 = vehicle.photos[0]?.startsWith('data:image');
              const isAvailable = !vehicle.status || vehicle.status === 'available';
              const statusBadge = vehicle.status === 'unavailable' ? 'Unavailable' :
                                 vehicle.status === 'maintenance' ? 'On Maintenance' : null;
              
              return (
                <Card 
                  key={vehicle.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${!isAvailable ? 'opacity-75' : ''}`}
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <CardContent className="p-4">
                    <div className="h-48 bg-muted rounded-lg mb-4 overflow-hidden relative">
                      {isBase64 ? (
                        <img 
                          src={vehicle.photos[0]} 
                          alt={vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Car className="h-12 w-12 text-primary/50" />
                        </div>
                      )}
                      {statusBadge && (
                        <Badge
                          variant={vehicle.status === 'unavailable' ? 'destructive' : 'secondary'}
                          className="absolute top-2 left-2"
                        >
                          {statusBadge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{vehicle.model}</CardTitle>
                      {vehicle.verified && (
                        <Badge variant="default" className="bg-green-500">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center mb-3">
                      <Badge variant="secondary">{vehicle.type}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">₱{vehicle.pricePerDay.toLocaleString()}/day</span>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRentNow(vehicle);
                        }}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Rent Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto mx-auto">
          {selectedVehicle && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>{selectedVehicle.model}</DialogTitle>
                <DialogDescription>
                  View details and message the provider
                </DialogDescription>
              </DialogHeader>
              {/* Photo Carousel */}
              <Carousel className="w-full">
                <CarouselContent>
                  {selectedVehicle.photos.map((photo, index) => {
                    const isBase64 = photo.startsWith('data:image');
                    return (
                      <CarouselItem key={index}>
                        <div className="h-[300px] sm:h-[400px] bg-muted rounded-lg overflow-hidden">
                          {isBase64 ? (
                            <img 
                              src={photo} 
                              alt={`${selectedVehicle.model} - Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <Car className="h-24 w-24 text-primary/50" />
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                {selectedVehicle.photos.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedVehicle.model}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{selectedVehicle.type}</Badge>
                        {selectedVehicle.verified && (
                          <Badge variant="default" className="bg-green-500">Verified</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">₱{selectedVehicle.pricePerDay.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedVehicle.location}</span>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedVehicle.description}</p>
                </div>

                <Separator />

                {/* Provider Info */}
                {(() => {
                  const provider = getProvider(selectedVehicle.providerId);
                  return provider ? (
                    <div>
                      <h3 className="font-semibold mb-3">Provider Information</h3>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={localStorage.getItem(`sakay-cebu-profile-pic-provider-${provider.id}`) || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {provider.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">{provider.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMessaging(!showMessaging)}
                          disabled={!user}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {showMessaging ? 'Hide Chat' : 'Message'}
                        </Button>
                      </div>

                      {/* Messaging Section */}
                      {showMessaging && user && (
                        <div className="mt-4 border rounded-lg">
                          <div className="p-3 bg-muted/50 border-b">
                            <h4 className="font-semibold text-sm">Chat with Provider</h4>
                          </div>
                          <ScrollArea className="h-[200px] p-4">
                            {(() => {
                              const conversation = conversations.find(c => 
                                c.vehicleId === selectedVehicle.id &&
                                c.participants.includes(user.id) &&
                                c.participants.includes(provider.id)
                              );
                              const messages = conversation ? getConversationMessages(conversation.id) : [];
                              
                              return messages.length > 0 ? (
                                <div className="space-y-3">
                                  {messages.map((msg) => (
                                    <div 
                                      key={msg.id}
                                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div className={`max-w-[70%] rounded-lg p-3 ${
                                        msg.senderId === user.id 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted'
                                      }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${
                                          msg.senderId === user.id 
                                            ? 'text-primary-foreground/70' 
                                            : 'text-muted-foreground'
                                        }`}>
                                          {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                  No messages yet. Start the conversation!
                                </div>
                              );
                            })()}
                          </ScrollArea>
                          <div className="p-3 border-t flex gap-2">
                            <Input
                              placeholder="Type your message..."
                              value={currentMessage}
                              onChange={(e) => setCurrentMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">Provider information not available</div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => handleRentNow(selectedVehicle)}
                >
                  Rent This Vehicle
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rental Modal */}
      <Dialog open={isRentalModalOpen} onOpenChange={setIsRentalModalOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle>Rent {selectedVehicle?.model}</DialogTitle>
            <DialogDescription>
              Complete the rental form to proceed with your vehicle rental.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4">
              {/* Vehicle Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedVehicle.model}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedVehicle.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{selectedVehicle.pricePerDay.toLocaleString()}/day</p>
                      <Badge variant="secondary" className="mt-1">{selectedVehicle.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Pickup Date *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={rentalForm.pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date *</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={rentalForm.returnDate}
                    min={rentalForm.pickupDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, returnDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Rental Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Select value={rentalForm.pickupTime} onValueChange={(value) => setRentalForm(prev => ({ ...prev, pickupTime: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnTime">Return Time</Label>
                  <Select value={rentalForm.returnTime} onValueChange={(value) => setRentalForm(prev => ({ ...prev, returnTime: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driverLicense">Driver's License Number *</Label>
                  <Input
                    id="driverLicense"
                    placeholder="Enter your driver's license number"
                    value={rentalForm.driverLicense}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, driverLicense: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={rentalForm.phoneNumber}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  value={rentalForm.notes}
                  onChange={(e) => setRentalForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Cost Summary */}
              {rentalForm.pickupDate && rentalForm.returnDate && (
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Total Rental Cost</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.ceil((new Date(rentalForm.returnDate).getTime() - new Date(rentalForm.pickupDate).getTime()) / (1000 * 3600 * 24))} day(s) @ ₱{selectedVehicle.pricePerDay.toLocaleString()}/day
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-primary">₱{calculateTotal().toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRentalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRentalSubmit}>
              Submit Rental Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
