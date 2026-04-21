import { Bike as BikeType } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Fuel, Gauge, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BikeCardProps {
  bike: BikeType;
  onBook: (bike: BikeType) => void;
  priority?: boolean;
}

export default function BikeCard({ bike, onBook, priority }: BikeCardProps) {
  // Optimize Unsplash image URLs
  const optimizedImage = bike.image.includes('unsplash.com') 
    ? `${bike.image.split('?')[0]}?auto=format&fit=crop&q=70&w=600&fm=webp`
    : bike.image;

  return (
    <motion.div
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden border-none bg-white shadow-xl shadow-gray-200/50 rounded-3xl group">
        <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-gray-100 animate-in fade-in duration-500">
          <img
            src={optimizedImage}
            alt={bike.name}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            className="w-full h-full object-cover transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=60&w=600`;
              target.onerror = null; // Prevent infinite loop
            }}
          />
          <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-dark border-none font-bold">
            {bike.type}
          </Badge>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
              <div className="flex items-center gap-1">
                {bike.fuelType === 'Electric' ? <Zap className="w-4 h-4 text-brand-orange" /> : <Fuel className="w-4 h-4 text-brand-orange" />}
                {bike.fuelType}
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4 text-brand-orange" />
                {bike.transmission}
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6 flex-grow flex flex-col min-h-0">
          <div className="flex justify-between items-start mb-4 gap-2 h-[64px]">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-brand-dark mb-1 line-clamp-1">{bike.name}</h3>
              <p className="text-sm text-gray-400 font-medium">{bike.specs?.engine || bike.specs?.range || 'N/A'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-brand-orange leading-none">₹{bike.pricePerDay}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Per Day</p>
            </div>
          </div>
          
          <div className="mt-auto mb-2">
            <div className="flex flex-wrap gap-1.5">
              {bike.locations.slice(0, 2).map(loc => (
                <span key={loc} className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                  {loc.split(',')[0]}
                </span>
              ))}
              {bike.locations.length > 2 && (
                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  +{bike.locations.length - 2}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button 
            className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white rounded-2xl h-12 font-bold group"
            onClick={() => onBook(bike)}
          >
            Rent Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
