import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const image = PlaceHolderImages.find(img => img.id === vehicle.photos[0]);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <div className="aspect-video overflow-hidden">
            {image && (
              <Image
                src={image.imageUrl}
                alt={vehicle.model}
                width={600}
                height={400}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 text-lg font-headline">
          <Link href={`/vehicles/${vehicle.id}`}>{vehicle.model}</Link>
        </CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Badge variant="outline">{vehicle.type}</Badge>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{vehicle.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-secondary/30">
        <div className="font-semibold">
          <span className="text-xl">₱{vehicle.pricePerDay.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <Button asChild>
          <Link href={`/vehicles/${vehicle.id}`}>Book Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
