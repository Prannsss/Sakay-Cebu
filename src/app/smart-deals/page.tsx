'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Clock, Tag } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SmartDealsPage() {
  const deals = [
    {
      title: "Weekend Special - IT Park Area",
      description: "20% off motorcycle rentals for weekend trips around IT Park and Capitol Site areas.",
      location: "IT Park, Cebu City",
      discount: "20% OFF",
      validUntil: "Valid until Sunday",
      category: "Motorcycle"
    },
    {
      title: "Ayala Center Shopping Deal",
      description: "Free parking included with car rentals when visiting Ayala Center Cebu for shopping.",
      location: "Ayala Center, Cebu City",
      discount: "Free Parking",
      validUntil: "All week",
      category: "Car"
    },
    {
      title: "Beach Day Package",
      description: "Special rates for cars and motorcycles heading to Mactan Island beaches.",
      location: "Mactan Island",
      discount: "15% OFF",
      validUntil: "Valid today",
      category: "All Vehicles"
    },
    {
      title: "Business District Commute",
      description: "Discounted rates for daily commuters in the Cebu Business Park area.",
      location: "Cebu Business Park",
      discount: "25% OFF",
      validUntil: "Weekdays only",
      category: "Motorcycle"
    },
    {
      title: "Airport Transfer Special",
      description: "Reduced rates for airport transfers to and from Mactan-Cebu International Airport.",
      location: "MCIA Airport",
      discount: "30% OFF",
      validUntil: "Valid all month",
      category: "Car"
    },
    {
      title: "University Area Deals",
      description: "Student-friendly rates for transportation around USC, SWU, and other universities.",
      location: "University Belt",
      discount: "Student Rate",
      validUntil: "School days",
      category: "Motorcycle"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Smart Deals</h1>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover personalized promotions and special offers based on your location and current events in Cebu.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{deal.title}</CardTitle>
                <Badge variant="secondary" className="ml-2 shrink-0">
                  {deal.discount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {deal.description}
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 shrink-0" />
                  <span>{deal.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1 shrink-0" />
                  <span>{deal.validUntil}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-3 w-3 mr-1 shrink-0" />
                  <span>{deal.category}</span>
                </div>
              </div>

              <Button className="w-full" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Claim Deal
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">More Deals Coming Soon!</h3>
        <p className="text-muted-foreground">
          We're working on AI-powered personalized deals based on your preferences and real-time events in Cebu.
        </p>
      </div>
    </div>
  );
}
