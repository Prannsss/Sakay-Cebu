'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { initialVehicles } from '@/lib/data';

const formSchema = z.object({
  model: z.string().min(2, 'Model is too short'),
  type: z.enum(['Cars', 'Motorcycles', 'Vans', 'Trucks', 'Multicab']),
  location: z.string().min(2, 'Location is too short'),
  pricePerDay: z.coerce.number().min(1, 'Price must be positive'),
  description: z.string().min(10, 'Description is too short'),
});

export default function AddVehiclePage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTOS = 10;

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'provider') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: '',
      location: '',
      description: '',
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Maximum photos reached',
        description: `You can only upload up to ${MAX_PHOTOS} photos.`,
        variant: 'destructive',
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit.`,
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file.`,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedPhotos(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    if (uploadedPhotos.length === 0) {
      toast({
        title: 'Photos required',
        description: 'Please upload at least one photo of your vehicle.',
        variant: 'destructive',
      });
      return;
    }

    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      providerId: user.id,
      verified: true, // Auto-approve vehicles
      photos: uploadedPhotos.length > 0 ? uploadedPhotos : ['sedan-1'], // Use uploaded photos or default
      availability: [{ from: new Date().toISOString(), to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() }],
      status: 'available', // Set initial status as available
      ...values,
    };
    setVehicles([...vehicles, newVehicle]);
    toast({
        title: 'Vehicle Posted Successfully!',
        description: 'Your vehicle is now live and available for booking.',
    });
    router.push('/provider/dashboard');
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">List a New Vehicle</CardTitle>
          <CardDescription>Fill out the details below to add your vehicle to Sakay Cebu.</CardDescription>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Vehicle Photos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload up to {MAX_PHOTOS} photos of your vehicle. First photo will be the main display image.
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedPhotos.length >= MAX_PHOTOS}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadedPhotos.length === 0 ? 'Upload Photos' : 'Add More Photos'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {uploadedPhotos.length} / {MAX_PHOTOS} photos
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-label="Upload vehicle photos"
                />
              </div>

              {/* Photo Preview Grid */}
              {uploadedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={photo}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-border"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No photos uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click the upload button above to add vehicle photos
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
              <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Toyota Vios" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Cars">Cars</SelectItem>
                        <SelectItem value="Motorcycles">Motorcycles</SelectItem>
                        <SelectItem value="Vans">Vans</SelectItem>
                        <SelectItem value="Trucks">Trucks</SelectItem>
                        <SelectItem value="Multicab">Multicab</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Cebu City" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="pricePerDay"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price per Day (PHP)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about your vehicle"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mention any special features or rules for your vehicle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || uploadedPhotos.length === 0}
              className="w-full"
              size="lg"
            >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? 'Posting Vehicle...' : 'Post Vehicle'}
            </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
