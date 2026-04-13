import { Bike as BikeType } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Fuel, Gauge, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BikeCardProps {
  bike: BikeType;
  onBook: (bike: BikeType) => void;
}

export default function BikeCard({ bike, onBook }: BikeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-none bg-white shadow-xl shadow-gray-200/50 rounded-3xl group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={bike.image}
            alt={bike.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
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
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-brand-dark mb-1">{bike.name}</h3>
              <p className="text-sm text-gray-500 font-medium">{bike.specs.engine || bike.specs.range}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-brand-orange">₹{bike.pricePerDay}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Day</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {bike.locations.map(loc => (
              <span key={loc} className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">
                {loc}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button 
            className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white rounded-2xl h-12 font-bold group"
            onClick={() => onBook(bike)}
          >
            Rent Now
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
