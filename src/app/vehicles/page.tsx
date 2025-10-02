'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Car, Bike, Truck, MapPin, Star, Search, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
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

  const vehicles = [
    {
      id: '1',
      model: 'Toyota Vios 2023',
      type: 'car',
      location: 'IT Park, Cebu City',
      price: 1500,
      rating: 4.8,
      reviews: 124,
      available: true
    },
    {
      id: '2',
      model: 'Honda Click 150i',
      type: 'motorcycle',
      location: 'Lahug, Cebu City',
      price: 500,
      rating: 4.6,
      reviews: 89,
      available: true
    },
    {
      id: '3',
      model: 'Isuzu Elf Truck',
      type: 'truck',
      location: 'Mandaue City',
      price: 3000,
      rating: 4.7,
      reviews: 56,
      available: true
    },
    {
      id: '4',
      model: 'Mitsubishi Mirage',
      type: 'car',
      location: 'Ayala Center, Cebu City',
      price: 1200,
      rating: 4.5,
      reviews: 78,
      available: true
    },
    {
      id: '5',
      model: 'Yamaha Mio',
      type: 'motorcycle',
      location: 'Colon Street, Cebu City',
      price: 400,
      rating: 4.4,
      reviews: 92,
      available: false
    },
    {
      id: '6',
      model: 'Ford Ranger',
      type: 'truck',
      location: 'Talamban, Cebu City',
      price: 2500,
      rating: 4.6,
      reviews: 43,
      available: true
    }
  ];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || vehicle.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const handleRentNow = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsRentalModalOpen(true);
  };

  const handleRentalSubmit = () => {
    // Basic validation
    if (!rentalForm.pickupDate || !rentalForm.returnDate || !rentalForm.driverLicense || !rentalForm.phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
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

    const totalCost = selectedVehicle.price * days;

    toast({
      title: 'Rental Request Submitted!',
      description: `Your rental request for ${selectedVehicle.model} has been submitted. Total cost: ₱${totalCost.toLocaleString()} for ${days} day(s). You will be contacted shortly.`,
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
    
    return days > 0 ? selectedVehicle.price * days : 0;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Vehicles</h1>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
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
                <SelectItem value="car">Cars</SelectItem>
                <SelectItem value="motorcycle">Motorcycles</SelectItem>
                <SelectItem value="truck">Trucks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Vehicle Type Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card 
          className={`text-center hover:shadow-lg transition-all cursor-pointer ${
            typeFilter === 'car' 
              ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
              : 'hover:bg-primary/5'
          }`} 
          onClick={() => setTypeFilter(typeFilter === 'car' ? 'all' : 'car')}
        >
          <CardContent className="pt-3 pb-3 sm:pt-6">
            <Car className={`h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 ${
              typeFilter === 'car' ? 'text-primary' : 'text-primary'
            }`} />
            <CardTitle className={`text-sm sm:text-lg ${
              typeFilter === 'car' ? 'text-primary font-bold' : ''
            }`}>Cars</CardTitle>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">Comfortable rides for city and long trips</CardDescription>
          </CardContent>
        </Card>
        <Card 
          className={`text-center hover:shadow-lg transition-all cursor-pointer ${
            typeFilter === 'motorcycle' 
              ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
              : 'hover:bg-primary/5'
          }`} 
          onClick={() => setTypeFilter(typeFilter === 'motorcycle' ? 'all' : 'motorcycle')}
        >
          <CardContent className="pt-3 pb-3 sm:pt-6">
            <Bike className={`h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 ${
              typeFilter === 'motorcycle' ? 'text-primary' : 'text-primary'
            }`} />
            <CardTitle className={`text-sm sm:text-lg ${
              typeFilter === 'motorcycle' ? 'text-primary font-bold' : ''
            }`}>Motorcycles</CardTitle>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">Quick and efficient for city navigation</CardDescription>
          </CardContent>
        </Card>
        <Card 
          className={`text-center hover:shadow-lg transition-all cursor-pointer ${
            typeFilter === 'truck' 
              ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20' 
              : 'hover:bg-primary/5'
          }`} 
          onClick={() => setTypeFilter(typeFilter === 'truck' ? 'all' : 'truck')}
        >
          <CardContent className="pt-3 pb-3 sm:pt-6">
            <Truck className={`h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 ${
              typeFilter === 'truck' ? 'text-primary' : 'text-primary'
            }`} />
            <CardTitle className={`text-sm sm:text-lg ${
              typeFilter === 'truck' ? 'text-primary font-bold' : ''
            }`}>Trucks</CardTitle>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">Heavy-duty vehicles for cargo and moving</CardDescription>
          </CardContent>
        </Card>
      </div>

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
              const getVehicleIcon = (type: string) => {
                switch (type) {
                  case 'car': return Car;
                  case 'motorcycle': return Bike;
                  case 'truck': return Truck;
                  default: return Car;
                }
              };
              
              const IconComponent = getVehicleIcon(vehicle.type);
              
              return (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <IconComponent className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{vehicle.model}</CardTitle>
                      {!vehicle.available && (
                        <Badge variant="secondary">Not Available</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{vehicle.rating} ({vehicle.reviews} reviews)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">₱{vehicle.price.toLocaleString()}/day</span>
                      <Button 
                        size="sm" 
                        disabled={!vehicle.available}
                        onClick={() => vehicle.available && handleRentNow(vehicle)}
                      >
                        {vehicle.available ? 'Rent Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
                      <p className="font-bold">₱{selectedVehicle.price.toLocaleString()}/day</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        {selectedVehicle.rating} ({selectedVehicle.reviews})
                      </p>
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
                          {Math.ceil((new Date(rentalForm.returnDate).getTime() - new Date(rentalForm.pickupDate).getTime()) / (1000 * 3600 * 24))} day(s) @ ₱{selectedVehicle.price.toLocaleString()}/day
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
