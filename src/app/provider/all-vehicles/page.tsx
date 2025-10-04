'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Car, Edit, MapPin, DollarSign, Calendar, Image as ImageIcon, X, Plus, Loader2, Trash2, Wrench, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AllVehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editForm, setEditForm] = useState({
    model: '',
    type: '' as Vehicle['type'],
    location: '',
    pricePerDay: 0,
    description: '',
    photos: [] as string[],
  });
  const [photoInput, setPhotoInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.role !== 'provider') {
    router.push('/login');
    return null;
  }

  // Filter out deleted vehicles
  const myVehicles = vehicles.filter((v: Vehicle) => v.providerId === user.id && v.status !== 'deleted');

  const handleToggleMaintenance = (vehicleId: string) => {
    const updatedVehicles = vehicles.map((v: Vehicle) => {
      if (v.id === vehicleId) {
        const newStatus: Vehicle['status'] = v.status === 'maintenance' ? 'available' : 'maintenance';
        return { ...v, status: newStatus };
      }
      return v;
    });
    setVehicles(updatedVehicles);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    toast({
      title: vehicle?.status === 'maintenance' ? 'Available Again' : 'Maintenance Mode',
      description: vehicle?.status === 'maintenance' 
        ? `${vehicle.model} is now available for rent.`
        : `${vehicle?.model} is marked as under maintenance.`,
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const updatedVehicles = vehicles.map((v: Vehicle) => {
      if (v.id === vehicleId) {
        return { ...v, status: 'deleted' as const };
      }
      return v;
    });
    setVehicles(updatedVehicles);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    toast({
      title: 'Vehicle Deleted',
      description: `${vehicle?.model} has been removed from your listings.`,
    });
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      model: vehicle.model,
      type: vehicle.type,
      location: vehicle.location,
      pricePerDay: vehicle.pricePerDay,
      description: vehicle.description,
      photos: [...vehicle.photos],
    });
    setIsEditModalOpen(true);
  };

  const handleAddPhoto = () => {
    if (!photoInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a photo first.',
      });
      return;
    }

    if (editForm.photos.length >= 10) {
      toast({
        variant: 'destructive',
        title: 'Maximum Photos Reached',
        description: 'You can only upload up to 10 photos per vehicle.',
      });
      return;
    }

    setEditForm(prev => ({
      ...prev,
      photos: [...prev.photos, photoInput],
    }));
    setPhotoInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editForm.photos.length >= 10) {
      toast({
        variant: 'destructive',
        title: 'Maximum Photos Reached',
        description: 'You can only upload up to 10 photos per vehicle.',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an image file (JPG, PNG, etc.).',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Image must be less than 5MB.',
      });
      return;
    }

    setIsLoading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditForm(prev => ({
        ...prev,
        photos: [...prev.photos, base64String],
      }));
      setIsLoading(false);
      toast({
        title: 'Photo Added',
        description: 'Photo uploaded successfully.',
      });
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload photo. Please try again.',
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleSaveEdit = () => {
    if (!selectedVehicle) return;

    // Validation
    if (!editForm.model || !editForm.type || !editForm.location || editForm.pricePerDay <= 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (editForm.photos.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Photos',
        description: 'Please add at least one photo.',
      });
      return;
    }

    // Update vehicle
    const updatedVehicles = vehicles.map((v: Vehicle) => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          model: editForm.model,
          type: editForm.type,
          location: editForm.location,
          pricePerDay: editForm.pricePerDay,
          description: editForm.description,
          photos: editForm.photos,
        };
      }
      return v;
    });

    setVehicles(updatedVehicles);
    setIsEditModalOpen(false);
    setSelectedVehicle(null);

    toast({
      title: 'Vehicle Updated',
      description: `${editForm.model} has been updated successfully.`,
    });
  };

  return (
    <div className="fixed inset-0 left-0 lg:left-64 bg-background overflow-hidden">
      <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">All Vehicles</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your vehicle listings
          </p>
        </div>

        <ScrollArea className="flex-1">
          {myVehicles.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <CardHeader>
                <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle>No Vehicles Listed</CardTitle>
                <CardDescription>You haven&apos;t added any vehicles yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/provider/add-vehicle')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-4">
              {myVehicles.map((vehicle: Vehicle) => {
                const isBase64 = vehicle.photos[0]?.startsWith('data:image');
                const photoUrl = isBase64 ? vehicle.photos[0] : undefined;

                return (
                  <Card key={vehicle.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        variant={vehicle.verified ? 'default' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {vehicle.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      {vehicle.status && vehicle.status !== 'available' && (
                        <Badge
                          variant={vehicle.status === 'unavailable' ? 'destructive' : 'secondary'}
                          className="absolute top-2 left-2"
                        >
                          {vehicle.status === 'unavailable' ? 'Unavailable' : 
                           vehicle.status === 'maintenance' ? 'Maintenance' : vehicle.status}
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{vehicle.model}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Car className="h-3 w-3" />
                          {vehicle.type}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {vehicle.location}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">₱{vehicle.pricePerDay.toLocaleString()}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{vehicle.photos.length} photo{vehicle.photos.length !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleEditClick(vehicle)}
                          variant="outline"
                          className="w-full"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Vehicle
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleToggleMaintenance(vehicle.id)}
                            variant={vehicle.status === 'maintenance' ? 'default' : 'secondary'}
                            size="sm"
                            className="w-full"
                            disabled={vehicle.status === 'unavailable'}
                          >
                            {vehicle.status === 'maintenance' ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Available
                              </>
                            ) : (
                              <>
                                <Wrench className="mr-1 h-3 w-3" />
                                Maintenance
                              </>
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {vehicle.model}? This vehicle will no longer appear in the explore page. This action can be reversed by editing your database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update your vehicle listing details and photos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model">Vehicle Model *</Label>
              <Input
                id="model"
                value={editForm.model}
                onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., Toyota Vios 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type *</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value as Vehicle['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cars">Cars</SelectItem>
                  <SelectItem value="Motorcycles">Motorcycles</SelectItem>
                  <SelectItem value="Vans">Vans</SelectItem>
                  <SelectItem value="Trucks">Trucks</SelectItem>
                  <SelectItem value="Multicab">Multicab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Cebu City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Day (₱) *</Label>
              <Input
                id="price"
                type="number"
                value={editForm.pricePerDay}
                onChange={(e) => setEditForm(prev => ({ ...prev, pricePerDay: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your vehicle..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Photos (Max 10) *</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    disabled={isLoading || editForm.photos.length >= 10}
                    className="flex-1"
                  />
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {editForm.photos.length}/10 photos uploaded
                </p>
              </div>

              {editForm.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {editForm.photos.map((photo, index) => {
                    const isBase64 = photo.startsWith('data:image');
                    return (
                      <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                        {isBase64 && (
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
