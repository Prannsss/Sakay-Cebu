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
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { initialVehicles } from '@/lib/data';

const formSchema = z.object({
  model: z.string().min(2, 'Model is too short'),
  type: z.enum(['Sedan', 'SUV', 'Motorcycle', 'Van']),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      providerId: user.id,
      verified: false,
      photos: ['sedan-1'], // Default photo
      availability: [{ from: new Date().toISOString(), to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() }],
      ...values,
    };
    setVehicles([...vehicles, newVehicle]);
    toast({
        title: 'Vehicle Added',
        description: 'Your vehicle has been submitted for verification.',
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
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">List a New Vehicle</CardTitle>
        <CardDescription>Fill out the details below to add your vehicle to Sakay Cebu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Verification
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
