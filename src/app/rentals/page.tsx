'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Rental } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import {
  getClientRentals,
  getUpcomingRentals,
  getActiveRentals,
  getPastRentals,
  hasRentalConflict,
  validateRentalDates,
  calculateRentalPrice,
  createRental,
} from '@/lib/rental-utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Car,
  Filter,
  Search,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';

export default function ClientRentalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [rentals, setRentals] = useLocalStorage<Rental[]>('sakay-cebu-rentals', []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('browse');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  
  const [rentalForm, setRentalForm] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (vehicle.status === 'deleted') return false;
    
    const matchesSearch =
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    const matchesLocation = !locationFilter || vehicle.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleRentNow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setRentalForm({
      startDate: '',
      endDate: '',
      notes: '',
    });
    setIsRentalModalOpen(true);
  };

  const handleRentalSubmit = () => {
    if (!user || !selectedVehicle) return;

    // Validate dates
    const dateValidation = validateRentalDates(rentalForm.startDate, rentalForm.endDate);
    if (!dateValidation.valid) {
      toast({
        variant: 'destructive',
        title: 'Invalid Dates',
        description: dateValidation.error,
      });
      return;
    }

    // Check for conflicts
    if (hasRentalConflict(selectedVehicle.id, rentalForm.startDate, rentalForm.endDate, rentals)) {
      toast({
        variant: 'destructive',
        title: 'Booking Conflict',
        description: 'This vehicle is already booked for the selected dates. Please choose different dates.',
      });
      return;
    }

    // Calculate price
    const totalPrice = calculateRentalPrice(
      rentalForm.startDate,
      rentalForm.endDate,
      selectedVehicle.pricePerDay
    );

    // Create rental
    const newRental = createRental(
      selectedVehicle.id,
      user.id,
      rentalForm.startDate,
      rentalForm.endDate,
      totalPrice,
      rentalForm.notes
    );

    setRentals([...rentals, newRental]);
    setIsRentalModalOpen(false);
    setSelectedVehicle(null);

    toast({
      title: 'Rental Request Submitted!',
      description: `Your rental request for ${selectedVehicle.model} has been submitted and is pending approval.`,
    });

    setSelectedTab('my-rentals');
  };

  const getStatusBadge = (status: Rental['status']) => {
    const variants: Record<Rental['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      Pending: { variant: 'secondary', icon: Clock },
      Approved: { variant: 'default', icon: CheckCircle },
      Rejected: { variant: 'destructive', icon: XCircle },
      Ongoing: { variant: 'default', icon: AlertCircle },
      Completed: { variant: 'outline', icon: CheckCircle },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const renderRentalCard = (rental: Rental) => {
    const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
    if (!vehicle) return null;

    const isBase64 = vehicle.photos[0]?.startsWith('data:image');
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card key={rental.rentalId} className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted flex-shrink-0">
            {isBase64 ? (
              <img
                src={vehicle.photos[0]}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold">{vehicle.model}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {vehicle.location}
                </p>
              </div>
              {getStatusBadge(rental.status)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{days} day{days > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-semibold">₱{rental.totalPrice?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center">
                <Badge variant="secondary">{vehicle.type}</Badge>
              </div>
            </div>

            {rental.notes && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                <p className="font-medium mb-1">Notes:</p>
                <p className="text-muted-foreground">{rental.notes}</p>
              </div>
            )}

            <div className="mt-3 text-xs text-muted-foreground">
              Requested: {new Date(rental.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myRentals = getClientRentals(user.id, rentals);
  const upcomingRentals = getUpcomingRentals(user.id, rentals);
  const activeRentals = getActiveRentals(user.id, rentals);
  const pastRentals = getPastRentals(user.id, rentals);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Vehicle Rentals</h1>
        <p className="text-muted-foreground mt-1">
          Browse available vehicles and manage your rental requests
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="browse">Browse Vehicles</TabsTrigger>
          <TabsTrigger value="my-rentals">
            My Rentals ({myRentals.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({pastRentals.length})
          </TabsTrigger>
        </TabsList>

        {/* Browse Vehicles Tab */}
        <TabsContent value="browse" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
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
              <div className="w-full">
                <Label>Filter by Location</Label>
                <LocationAutocomplete
                  value={locationFilter}
                  onChange={setLocationFilter}
                  placeholder="Search location..."
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isBase64 = vehicle.photos[0]?.startsWith('data:image');
                const isAvailable = !vehicle.status || vehicle.status === 'available';

                return (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted overflow-hidden">
                      {isBase64 ? (
                        <img
                          src={vehicle.photos[0]}
                          alt={vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{vehicle.model}</h3>
                        {vehicle.yearModel && (
                          <Badge variant="secondary">{vehicle.yearModel}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {vehicle.location}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{vehicle.type}</Badge>
                        {vehicle.transmission && (
                          <Badge variant="outline">{vehicle.transmission}</Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold">₱{vehicle.pricePerDay.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">/day</span>
                        </div>
                        <Button
                          onClick={() => handleRentNow(vehicle)}
                          disabled={!isAvailable}
                          size="sm"
                        >
                          {isAvailable ? 'Rent Now' : 'Unavailable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* My Rentals Tab */}
        <TabsContent value="my-rentals" className="space-y-4">
          {myRentals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No rental requests yet</p>
                <p className="text-muted-foreground mb-4">Start browsing vehicles to make your first rental</p>
                <Button onClick={() => setSelectedTab('browse')}>Browse Vehicles</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRentals.map(renderRentalCard)}
            </div>
          )}
        </TabsContent>

        {/* Upcoming Rentals Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRentals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No upcoming rentals</p>
                <p className="text-muted-foreground">Your approved future rentals will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingRentals.map(renderRentalCard)}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {pastRentals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No rental history</p>
                <p className="text-muted-foreground">Your completed rentals will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastRentals.map(renderRentalCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rental Modal */}
      <Dialog open={isRentalModalOpen} onOpenChange={setIsRentalModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rent {selectedVehicle?.model}</DialogTitle>
            <DialogDescription>
              Fill in the details to submit your rental request
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">
              {/* Vehicle Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{selectedVehicle.model}</h3>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedVehicle.location}
                      </p>
                      {selectedVehicle.yearModel && (
                        <Badge variant="secondary" className="mt-2">
                          {selectedVehicle.yearModel}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₱{selectedVehicle.pricePerDay.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={rentalForm.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setRentalForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={rentalForm.endDate}
                    min={rentalForm.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setRentalForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or questions..."
                  value={rentalForm.notes}
                  onChange={(e) =>
                    setRentalForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Cost Summary */}
              {rentalForm.startDate && rentalForm.endDate && (
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Estimated Total</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.ceil(
                            (new Date(rentalForm.endDate).getTime() -
                              new Date(rentalForm.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          day(s) @ ₱{selectedVehicle.pricePerDay.toLocaleString()}/day
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        ₱
                        {calculateRentalPrice(
                          rentalForm.startDate,
                          rentalForm.endDate,
                          selectedVehicle.pricePerDay
                        ).toLocaleString()}
                      </p>
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
            <Button
              onClick={handleRentalSubmit}
              disabled={!rentalForm.startDate || !rentalForm.endDate}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
