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
import { isDateDisabled, getAvailableTimes, isTimeSlotAvailable, TIME_SLOTS } from '../lib/availability';

interface HeroProps {
  onSearch: (details: BookingDetails) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(new Date(Date.now() + 86400000));
  const [rentLocation, setRentLocation] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [dropoffTime, setDropoffTime] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newErrors: Record<string, string> = {};
    
    if (!rentLocation) newErrors.rentLocation = "Please select a rent location";
    if (!pickupDate) newErrors.pickupDate = "Please select a pickup date";
    if (!pickupTime) newErrors.pickupTime = "Please select a pickup time";
    if (!dropoffDate) {
      newErrors.dropoffDate = "Please select a dropoff date";
    } else if (pickupDate) {
      // Compare dates only (ignore time)
      const pDate = new Date(pickupDate);
      pDate.setHours(0, 0, 0, 0);
      const dDate = new Date(dropoffDate);
      dDate.setHours(0, 0, 0, 0);
      
      if (dDate < pDate) {
        newErrors.dropoffDate = "Dropoff cannot be before pickup";
      }
    }

    if (!dropoffTime) {
      newErrors.dropoffTime = "Please select a dropoff time";
    } else if (pickupDate && dropoffDate && pickupDate.toDateString() === dropoffDate.toDateString()) {
      const [pH, pM] = pickupTime.split(':').map(Number);
      const [dH, dM] = dropoffTime.split(':').map(Number);
      if (dH < pH || (dH === pH && dM <= pM)) {
        newErrors.dropoffTime = "Must be after pickup time";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSearch({
      pickupLocation: rentLocation,
      dropoffLocation: rentLocation,
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
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Freedom to Explore <br />
              <span className="text-brand-orange">Tamil Nadu</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
              Experience the breathtaking landscapes of Ooty, the energy of Chennai, and the charm of Coimbatore with Milez. Well-maintained bikes at affordable rates.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-2xl px-8 h-14 text-lg font-bold shadow-lg shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95"
                onClick={() => {
                  const element = document.getElementById('explore');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Fleet
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-white hover:bg-white/10 rounded-2xl px-8 h-14 text-lg font-bold transition-all hover:scale-105 active:scale-95"
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
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-xl mx-auto lg:mx-0"
          >
            <Card className="bg-black/40 backdrop-blur-2xl p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-8 md:text-10 tracking-tight text-left">Find your vehicle</h3>
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Rent Location</label>
                  <Popover>
                    <PopoverTrigger render={
                      <Button variant="outline" className={`w-full bg-white/5 border-white/10 text-white h-16 md:h-20 rounded-2xl focus:ring-brand-orange border hover:bg-white/10 transition-all group px-4 md:px-6 justify-start text-left ${errors.rentLocation ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                        <div className="flex items-center gap-3 md:gap-4 w-full h-full">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 group-hover:bg-brand-orange/20 transition-colors">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand-orange group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex flex-col items-start justify-center flex-1 min-w-0 h-full py-2">
                            <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none mb-1 md:mb-1.5">Location</span>
                            <span className="text-sm md:text-base font-bold leading-none truncate">
                              {rentLocation || "Select City"}
                            </span>
                          </div>
                        </div>
                      </Button>
                    } />
                    <PopoverContent className="w-[300px] md:w-[400px] p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-brand-dark text-white dark" align="start">
                      <div className="p-4 border-b border-white/5">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input 
                            type="text"
                            placeholder="Search city..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">
                          Available Cities
                        </div>
                        {LOCATIONS.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase())).map(loc => (
                          <button
                            key={loc}
                            onClick={() => {
                              setRentLocation(loc);
                              setLocationSearch('');
                              if (errors.rentLocation) setErrors(prev => ({ ...prev, rentLocation: '' }));
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                              <MapPin className="w-4 h-4 text-white/40 group-hover:text-brand-orange transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">{loc.split(',')[0]}</span>
                              <span className="text-[10px] text-white/40 font-medium">{loc.split(',')[1] || 'Tamil Nadu'}</span>
                            </div>
                          </button>
                        ))}
                        {LOCATIONS.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                          <div className="p-8 text-center">
                            <MapPin className="w-8 h-8 text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-white/40">No cities found matching "{locationSearch}"</p>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.rentLocation && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 tracking-wide">{errors.rentLocation}</p>}
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Pickup Date & Time</label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-3 space-y-1">
                        <Popover>
                          <PopoverTrigger render={
                            <Button variant="outline" className={`w-full h-16 md:h-20 bg-white/5 border-white/10 text-white justify-start text-left font-bold rounded-2xl hover:bg-white/10 transition-all border group px-4 md:px-6 ${errors.pickupDate ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mr-3 md:mr-4 group-hover:bg-brand-orange/20 transition-colors">
                                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-brand-orange group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col items-start justify-center h-full py-2">
                                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none mb-1 md:mb-1.5">Date</span>
                                <span className="text-sm md:text-base font-bold whitespace-nowrap leading-none">{pickupDate ? format(pickupDate, "MMM dd, yyyy") : "Select Date"}</span>
                              </div>
                            </Button>
                          } />
                          <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-brand-dark text-white dark" align="start">
                            <Calendar
                              mode="single"
                              selected={pickupDate}
                              onSelect={(date) => {
                                handlePickupDateSelect(date);
                                if (errors.pickupDate) setErrors(prev => ({ ...prev, pickupDate: '' }));
                              }}
                              disabled={isDateDisabled}
                              initialFocus
                              className="p-4"
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.pickupDate && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 tracking-wide">{errors.pickupDate}</p>}
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Popover>
                          <PopoverTrigger render={
                            <Button variant="outline" className={`w-full h-16 md:h-20 bg-white/5 border-white/10 text-white justify-start text-left font-bold rounded-2xl hover:bg-white/10 transition-all border group px-4 md:px-6 ${errors.pickupTime ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mr-3 md:mr-4 group-hover:bg-brand-orange/20 transition-colors">
                                <Clock className="h-4 w-4 md:h-5 md:w-5 text-brand-orange group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col items-start justify-center h-full py-2">
                                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none mb-1 md:mb-1.5">Time</span>
                                <span className="text-sm md:text-base font-bold whitespace-nowrap leading-none">{pickupTime || "Select Time"}</span>
                              </div>
                            </Button>
                          } />
                          <PopoverContent className="w-[280px] p-4 border-none shadow-2xl rounded-3xl overflow-hidden bg-brand-dark text-white dark" align="end">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Pickup Time</p>
                                <Clock className="w-3 h-3 text-brand-orange" />
                              </div>
                              <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                {TIME_SLOTS.map(time => {
                                  const isAvailable = isTimeSlotAvailable(pickupDate, time);
                                  const isSelected = pickupTime === time;
                                  return (
                                    <button
                                      key={time}
                                      disabled={!isAvailable}
                                      onClick={() => {
                                        setPickupTime(time);
                                        if (errors.pickupTime) setErrors(prev => ({ ...prev, pickupTime: '' }));
                                      }}
                                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                        isSelected 
                                          ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
                                          : isAvailable 
                                            ? 'bg-white/5 text-white hover:bg-white/10' 
                                            : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {errors.pickupTime && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 tracking-wide">{errors.pickupTime}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Dropoff Date & Time</label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-3 space-y-1">
                        <Popover>
                          <PopoverTrigger render={
                            <Button variant="outline" className={`w-full h-16 md:h-20 bg-white/5 border-white/10 text-white justify-start text-left font-bold rounded-2xl hover:bg-white/10 transition-all border group px-4 md:px-6 ${errors.dropoffDate ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mr-3 md:mr-4 group-hover:bg-brand-orange/20 transition-colors">
                                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-brand-orange group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col items-start justify-center h-full py-2">
                                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none mb-1 md:mb-1.5">Date</span>
                                <span className="text-sm md:text-base font-bold whitespace-nowrap leading-none">{dropoffDate ? format(dropoffDate, "MMM dd, yyyy") : "Select Date"}</span>
                              </div>
                            </Button>
                          } />
                          <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-brand-dark text-white dark" align="start">
                            <Calendar
                              mode="single"
                              selected={dropoffDate}
                              onSelect={(date) => {
                                handleDropoffDateSelect(date);
                                if (errors.dropoffDate) setErrors(prev => ({ ...prev, dropoffDate: '' }));
                              }}
                              disabled={isDateDisabled}
                              initialFocus
                              className="p-4"
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.dropoffDate && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 tracking-wide">{errors.dropoffDate}</p>}
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Popover>
                          <PopoverTrigger render={
                            <Button variant="outline" className={`w-full h-16 md:h-20 bg-white/5 border-white/10 text-white justify-start text-left font-bold rounded-2xl hover:bg-white/10 transition-all border group px-4 md:px-6 ${errors.dropoffTime ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mr-3 md:mr-4 group-hover:bg-brand-orange/20 transition-colors">
                                <Clock className="h-4 w-4 md:h-5 md:w-5 text-brand-orange group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col items-start justify-center h-full py-2">
                                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest leading-none mb-1 md:mb-1.5">Time</span>
                                <span className="text-sm md:text-base font-bold whitespace-nowrap leading-none">{dropoffTime || "Select Time"}</span>
                              </div>
                            </Button>
                          } />
                          <PopoverContent className="w-[280px] p-4 border-none shadow-2xl rounded-3xl overflow-hidden bg-brand-dark text-white dark" align="end">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Drop-off Time</p>
                                <Clock className="w-3 h-3 text-brand-orange" />
                              </div>
                              <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                {TIME_SLOTS.map(time => {
                                  const isAvailable = isTimeSlotAvailable(dropoffDate, time);
                                  const isSelected = dropoffTime === time;
                                  return (
                                    <button
                                      key={time}
                                      disabled={!isAvailable}
                                      onClick={() => {
                                        setDropoffTime(time);
                                        if (errors.dropoffTime) setErrors(prev => ({ ...prev, dropoffTime: '' }));
                                      }}
                                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                        isSelected 
                                          ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
                                          : isAvailable 
                                            ? 'bg-white/5 text-white hover:bg-white/10' 
                                            : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {errors.dropoffTime && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 tracking-wide">{errors.dropoffTime}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-16 md:h-20 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-2xl md:rounded-[24px] text-lg md:text-xl font-bold shadow-2xl shadow-brand-orange/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                  onClick={handleSearch}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Search className="w-5 h-5 md:w-6 md:h-6" />
                    <span>Search Available Bikes</span>
                  </div>
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block cursor-pointer group"
        onClick={() => {
          const element = document.getElementById('how-it-works');
          element?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 group-hover:border-white transition-colors">
          <div className="w-1.5 h-1.5 bg-brand-orange rounded-full shadow-[0_0_8px_rgba(242,125,38,0.8)]" />
        </div>
      </motion.div>
    </section>
  );
}
