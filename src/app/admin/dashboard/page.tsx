'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Provider } from '@/lib/types';
import { initialVehicles, initialProviders } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const { user, providers, setProviders } = useAuth();
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleProviderVerification = (providerId: string, status: boolean) => {
    setProviders(providers.map(p => p.id === providerId ? { ...p, verified: status } : p));
    toast({ title: `Provider ${status ? 'approved' : 'rejected'}.` });
  };

  const handleVehicleVerification = (vehicleId: string, status: boolean) => {
    setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, verified: status } : v));
     toast({ title: `Vehicle ${status ? 'approved' : 'rejected'}.` });
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingProviders = providers.filter(p => !p.verified);
  const pendingVehicles = vehicles.filter(v => !v.verified);

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Approve new providers and vehicles.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Pending Provider Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                {pendingProviders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingProviders.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.email}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button size="sm" variant="success" onClick={() => handleProviderVerification(p.id, true)}><CheckCircle className='w-4 h-4 mr-2'/>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleProviderVerification(p.id, false)}><XCircle className='w-4 h-4 mr-2'/>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <p className="text-sm text-muted-foreground">No pending provider approvals.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Pending Vehicle Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                {pendingVehicles.length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow><TableHead>Model</TableHead><TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead>Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingVehicles.map(v => {
                                const provider = providers.find(p => p.id === v.providerId);
                                return (
                                <TableRow key={v.id}>
                                    <TableCell>{v.model}</TableCell>
                                    <TableCell>{v.type}</TableCell>
                                    <TableCell>{provider?.name || 'Unknown'}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button size="sm" variant="success" onClick={() => handleVehicleVerification(v.id, true)}><CheckCircle className='w-4 h-4 mr-2'/>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleVehicleVerification(v.id, false)}><XCircle className='w-4 h-4 mr-2'/>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                ) : <p className="text-sm text-muted-foreground">No pending vehicle approvals.</p>}
            </CardContent>
        </Card>
    </div>
  );
}
