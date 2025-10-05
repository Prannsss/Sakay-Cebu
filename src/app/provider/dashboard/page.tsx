'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Loader2, PlusCircle, Car, Eye, Calendar, TrendingUp, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Vehicle, Booking } from '@/lib/types';
import { initialVehicles } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [bookings] = useLocalStorage<Booking[]>('sakay-cebu-bookings', []);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBookingPage, setCurrentBookingPage] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsTimePeriod, setAnalyticsTimePeriod] = useState<'today' | 'week' | 'month' | 'lastMonth'>('month');

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'provider') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const providerVehicles = vehicles.filter(v => v.providerId === user.id);
  const providerBookings = bookings.filter(booking => 
    providerVehicles.some(vehicle => vehicle.id === booking.vehicleId)
  );

  // Helper function to filter bookings by time period
  const filterBookingsByPeriod = (bookings: Booking[], period: 'today' | 'week' | 'month' | 'lastMonth') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt || booking.startDate);
      
      switch (period) {
        case 'today':
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          return bookingDay.getTime() === today.getTime();
        
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return bookingDate >= weekAgo && bookingDate <= now;
        
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
        
        case 'lastMonth':
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
        
        default:
          return true;
      }
    });
  };

  // Filter bookings based on selected time period for analytics
  const filteredBookings = filterBookingsByPeriod(providerBookings, analyticsTimePeriod);

  // Analytics calculations
  const totalEarnings = providerBookings
    .filter(booking => booking.status === 'active' || booking.status === 'completed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  const activeBookings = providerBookings.filter(booking => 
    booking.status === 'active'
  ).length;
  
  const totalViews = providerVehicles.length * 150; // Mock views data
  const verifiedVehicles = providerVehicles.filter(vehicle => vehicle.verified).length;

  // Pie chart data: Rentals by vehicle type (filtered by time period)
  const rentalsByType = filteredBookings.reduce((acc, booking) => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    if (vehicle) {
      const type = vehicle.type;
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(rentalsByType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Calculate breakdown statistics for filtered period
  const periodEarnings = filteredBookings
    .filter(booking => booking.status === 'active' || booking.status === 'completed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  const periodPendingCount = filteredBookings.filter(b => b.status === 'pending').length;
  const periodActiveCount = filteredBookings.filter(b => b.status === 'active').length;
  const periodCompletedCount = filteredBookings.filter(b => b.status === 'completed').length;
  const periodCancelledCount = filteredBookings.filter(b => b.status === 'cancelled').length;

  const averageRentalValue = filteredBookings.length > 0 
    ? periodEarnings / filteredBookings.length 
    : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="fixed inset-0 left-0 top-0 bottom-0 lg:left-64 bg-background overflow-auto">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-headline">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your vehicles and track your business performance</p>
        </div>
        {/* Desktop Add Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Button asChild>
            <Link href="/provider/add-vehicle">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Link 
        href="/provider/add-vehicle"
        className="lg:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110"
      >
        <PlusCircle className="h-6 w-6" />
      </Link>

      {/* Container with mobile flex ordering */}
      <div className="flex flex-col space-y-6">
        {/* Analytics Cards - Shows first on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 order-1 lg:order-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8 p-0"
              size="icon"
            >
              {showAnalytics ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">₱{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {providerBookings.length} bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently rented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{providerVehicles.length}</div>
            <p className="text-xs text-muted-foreground">{verifiedVehicles} verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Vehicle impressions</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics - Pie Chart (Collapsible) - Shows above Recent Bookings when visible */}
      {showAnalytics && (
      <div className="order-2 lg:order-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Rental Analytics</CardTitle>
              <CardDescription>Distribution of rentals across different vehicle categories</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAnalytics(false)}
              className="h-8 w-8 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="month" className="w-full" onValueChange={(value) => setAnalyticsTimePeriod(value as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-0">
                {pieChartData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chart Section */}
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing rentals from today ({new Date().toLocaleDateString()})
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium">Total Rentals: {filteredBookings.length}</p>
                      </div>
                    </div>

                    {/* Breakdown Section */}
                    <div className="w-full lg:w-80 space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Data Breakdown</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Total Revenue</span>
                            <span className="font-semibold">₱{periodEarnings.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Avg per Rental</span>
                            <span className="font-semibold">₱{Math.round(averageRentalValue).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Rental Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">Pending</span>
                              </div>
                              <span className="font-medium">{periodPendingCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">Active</span>
                              </div>
                              <span className="font-medium">{periodActiveCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">Completed</span>
                              </div>
                              <span className="font-medium">{periodCompletedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm">Cancelled</span>
                              </div>
                              <span className="font-medium">{periodCancelledCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Vehicle Types</h4>
                          <div className="space-y-2">
                            {pieChartData.map((item, index) => (
                              <div key={item.name} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  ></div>
                                  <span className="text-sm">{item.name}</span>
                                </div>
                                <span className="font-medium">{item.value} ({Math.round((item.value / filteredBookings.length) * 100)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rental data for today</p>
                    <p className="text-sm text-muted-foreground mt-2">Check other time periods for data</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                {pieChartData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chart Section */}
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing rentals from the last 7 days
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium">Total Rentals: {filteredBookings.length}</p>
                      </div>
                    </div>

                    {/* Breakdown Section */}
                    <div className="w-full lg:w-80 space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Data Breakdown</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Total Revenue</span>
                            <span className="font-semibold">₱{periodEarnings.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Avg per Rental</span>
                            <span className="font-semibold">₱{Math.round(averageRentalValue).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Rental Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">Pending</span>
                              </div>
                              <span className="font-medium">{periodPendingCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">Active</span>
                              </div>
                              <span className="font-medium">{periodActiveCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">Completed</span>
                              </div>
                              <span className="font-medium">{periodCompletedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm">Cancelled</span>
                              </div>
                              <span className="font-medium">{periodCancelledCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Vehicle Types</h4>
                          <div className="space-y-2">
                            {pieChartData.map((item, index) => {
                              const color = COLORS[index % COLORS.length];
                              return (
                                <div key={item.name} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value} ({Math.round((item.value / filteredBookings.length) * 100)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rental data this week</p>
                    <p className="text-sm text-muted-foreground mt-2">Check other time periods for data</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="month" className="mt-0">
                {pieChartData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chart Section */}
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing rentals for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium">Total Rentals: {filteredBookings.length}</p>
                      </div>
                    </div>

                    {/* Breakdown Section */}
                    <div className="w-full lg:w-80 space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Data Breakdown</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Total Revenue</span>
                            <span className="font-semibold">₱{periodEarnings.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Avg per Rental</span>
                            <span className="font-semibold">₱{Math.round(averageRentalValue).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Rental Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">Pending</span>
                              </div>
                              <span className="font-medium">{periodPendingCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">Active</span>
                              </div>
                              <span className="font-medium">{periodActiveCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">Completed</span>
                              </div>
                              <span className="font-medium">{periodCompletedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm">Cancelled</span>
                              </div>
                              <span className="font-medium">{periodCancelledCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Vehicle Types</h4>
                          <div className="space-y-2">
                            {pieChartData.map((item, index) => {
                              const color = COLORS[index % COLORS.length];
                              return (
                                <div key={item.name} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value} ({Math.round((item.value / filteredBookings.length) * 100)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rental data this month</p>
                    <p className="text-sm text-muted-foreground mt-2">Analytics will appear once you receive bookings</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lastMonth" className="mt-0">
                {pieChartData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Chart Section */}
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing rentals for {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium">Total Rentals: {filteredBookings.length}</p>
                      </div>
                    </div>

                    {/* Breakdown Section */}
                    <div className="w-full lg:w-80 space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Data Breakdown</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Total Revenue</span>
                            <span className="font-semibold">₱{periodEarnings.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Avg per Rental</span>
                            <span className="font-semibold">₱{Math.round(averageRentalValue).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Rental Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">Pending</span>
                              </div>
                              <span className="font-medium">{periodPendingCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">Active</span>
                              </div>
                              <span className="font-medium">{periodActiveCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">Completed</span>
                              </div>
                              <span className="font-medium">{periodCompletedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm">Cancelled</span>
                              </div>
                              <span className="font-medium">{periodCancelledCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-xs text-muted-foreground mb-2">Vehicle Types</h4>
                          <div className="space-y-2">
                            {pieChartData.map((item, index) => {
                              const color = COLORS[index % COLORS.length];
                              return (
                                <div key={item.name} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value} ({Math.round((item.value / filteredBookings.length) * 100)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rental data last month</p>
                    <p className="text-sm text-muted-foreground mt-2">Check other time periods for data</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Recent Bookings - Shows after analytics (if shown) */}
      {providerBookings.length > 0 && (
        <Card className="order-3 lg:order-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest rental requests and active bookings</CardDescription>
            </div>
            <Link href="/provider/rental-requests">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <span className="hidden sm:inline">Requests</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerBookings
                    .slice(currentBookingPage * 5, (currentBookingPage * 5) + 5)
                    .map(booking => {
                      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{vehicle?.model || 'Unknown'}</TableCell>
                          <TableCell>Customer #{booking.userId.slice(-4)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₱{booking.totalPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'active' ? 'success' :
                              'destructive'
                            }>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentBookingPage(prev => Math.max(0, prev - 1))}
                disabled={currentBookingPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentBookingPage(prev => Math.min(Math.floor(providerBookings.length / 5), prev + 1))}
                disabled={currentBookingPage >= Math.floor(providerBookings.length / 5)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Management - Shows after Recent Bookings */}
      {providerVehicles.length > 0 ? (
        <Card className="order-4 lg:order-4">
          <CardHeader>
            <CardTitle>My Vehicles</CardTitle>
            <CardDescription>Manage your vehicle listings and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerVehicles.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.model}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.location}</TableCell>
                      <TableCell>₱{vehicle.pricePerDay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.verified ? 'success' : 'secondary'}>
                          {vehicle.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center order-4 lg:order-4">
          <CardHeader>
            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Vehicles Listed</CardTitle>
            <CardDescription>You haven&apos;t added any vehicles yet. List your first vehicle to start earning!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/provider/add-vehicle">Add Your First Vehicle</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      </div>
      </div>
    </div>
  );
}
