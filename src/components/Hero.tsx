import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar as CalendarIcon, Search, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { LOCATIONS } from '../data/bikes';
import { BookingDetails } from '../types';
import { isDateDisabled, getAvailableTimes, isTimeSlotAvailable } from '../lib/availability';

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

interface HeroProps {
  onSearch: (details: BookingDetails) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(new Date(Date.now() + 86400000));
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropoffLocation, setDropoffLocation] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('09:00');
  const [dropoffTime, setDropoffTime] = useState<string>('09:00');

  // Update time if it becomes unavailable when date changes
  const handlePickupDateSelect = (date: Date | undefined) => {
    setPickupDate(date);
    if (date && !isTimeSlotAvailable(date, pickupTime)) {
      const available = getAvailableTimes(date);
      if (available.length > 0) setPickupTime(available[0]);
    }
  };

  const handleDropoffDateSelect = (date: Date | undefined) => {
    setDropoffDate(date);
    if (date && !isTimeSlotAvailable(date, dropoffTime)) {
      const available = getAvailableTimes(date);
      if (available.length > 0) setDropoffTime(available[0]);
    }
  };

  const handleSearch = () => {
    onSearch({
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
    });
    const element = document.getElementById('explore');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=2000"
          alt="Bike adventure"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-brand-dark" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
              </span>
              Premium Bike Rentals
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Freedom to Explore <br />
              <span className="text-brand-orange">Tamil Nadu</span>
            </h1>
            <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
              Experience the breathtaking landscapes of Ooty, the energy of Chennai, and the charm of Coimbatore with Milez. Well-maintained bikes at affordable rates.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-14 text-lg"
                onClick={handleSearch}
              >
                Explore Fleet
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-white/80 bg-white/20 backdrop-blur-md hover:bg-white/35 rounded-full px-8 h-14 text-lg transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How it Works
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-dark p-8 rounded-[32px] border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Find Your Ride</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Pickup Location</label>
                    <Select value={pickupLocation} onValueChange={setPickupLocation}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-orange" />
                          <SelectValue placeholder="Select City" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Dropoff Location</label>
                    <Select value={dropoffLocation} onValueChange={setDropoffLocation}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-orange" />
                          <SelectValue placeholder="Select City" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Pickup Date & Time</label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger render={
                          <Button variant="outline" className="flex-1 h-12 bg-white/5 border-white/10 text-white justify-start text-left font-normal rounded-xl hover:bg-white/10">
                            <CalendarIcon className="mr-2 h-4 w-4 text-brand-orange" />
                            {pickupDate ? format(pickupDate, "MMM dd") : <span>Date</span>}
                          </Button>
                        } />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={handlePickupDateSelect}
                            disabled={isDateDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Select value={pickupTime} onValueChange={setPickupTime}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-orange" />
                            <SelectValue placeholder="Time" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem 
                              key={time} 
                              value={time}
                              disabled={!isTimeSlotAvailable(pickupDate, time)}
                            >
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Dropoff Date & Time</label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger render={
                          <Button variant="outline" className="flex-1 h-12 bg-white/5 border-white/10 text-white justify-start text-left font-normal rounded-xl hover:bg-white/10">
                            <CalendarIcon className="mr-2 h-4 w-4 text-brand-orange" />
                            {dropoffDate ? format(dropoffDate, "MMM dd") : <span>Date</span>}
                          </Button>
                        } />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dropoffDate}
                            onSelect={handleDropoffDateSelect}
                            disabled={isDateDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Select value={dropoffTime} onValueChange={setDropoffTime}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-orange" />
                            <SelectValue placeholder="Time" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem 
                              key={time} 
                              value={time}
                              disabled={!isTimeSlotAvailable(dropoffDate, time)}
                            >
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-14 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-lg font-bold shadow-lg shadow-brand-orange/20"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Available Bikes
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-brand-orange rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
