import { useState, useEffect } from 'react';
import { BIKES, LOCATIONS } from '../data/bikes';
import BikeCard from './BikeCard';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { areIntervalsOverlapping, parse } from 'date-fns';
import { Loader2, Info, LayoutGrid, GalleryHorizontal } from 'lucide-react';

import { Bike, BookingDetails } from '../types';

interface BikeGridProps {
  onBook: (bike: Bike) => void;
  bookingDetails: BookingDetails;
}

export default function BikeGrid({ onBook, bookingDetails }: BikeGridProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [activeLocation, setActiveLocation] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [dbBikes, setDbBikes] = useState<Bike[]>([]);
  const [unavailableBikeIds, setUnavailableBikeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Sync activeLocation with bookingDetails when a search is performed
  useEffect(() => {
    if (bookingDetails.pickupLocation) {
      setActiveLocation(bookingDetails.pickupLocation);
    }
  }, [bookingDetails.pickupLocation]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bikes'), (snapshot) => {
      const bikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
      setDbBikes(bikes);
      setLoading(false);
    }, (error) => {
      console.error('Firestore bikes error:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Live Availability Filtering
  useEffect(() => {
    const checkAvailability = async () => {
      if (!bookingDetails.pickupDate || !bookingDetails.dropoffDate || !bookingDetails.pickupLocation) {
        setUnavailableBikeIds([]);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        // Construct search interval
        const start = new Date(bookingDetails.pickupDate);
        const [p_h, p_m] = bookingDetails.pickupTime.split(':').map(Number);
        start.setHours(p_h, p_m, 0, 0);

        const end = new Date(bookingDetails.dropoffDate);
        const [d_h, d_m] = bookingDetails.dropoffTime.split(':').map(Number);
        end.setHours(d_h, d_m, 0, 0);

        // Fetch all confirmed AND pending bookings (to be safe)
        const bookingsRef = collection(db, 'public_bookings');
        const q = query(bookingsRef, where('status', 'in', ['confirmed', 'pending']));
        const snapshot = await getDocs(q);

        const busyIds: string[] = [];
        snapshot.docs.forEach(doc => {
          const booking = doc.data();
          if (!booking.bike?.id) return;

          // Robust date parsing
          let b_start: Date;
          let b_end: Date;

          try {
            // Try parsing the 'PPP' format (e.g., "Oct 24, 2023")
            b_start = parse(booking.bookingDetails.pickupDate, 'PPP', new Date());
            b_end = parse(booking.bookingDetails.dropoffDate, 'PPP', new Date());
            
            // If parse fails or results in Invalid Date, fallback to new Date()
            if (isNaN(b_start.getTime())) b_start = new Date(booking.bookingDetails.pickupDate);
            if (isNaN(b_end.getTime())) b_end = new Date(booking.bookingDetails.dropoffDate);
          } catch (e) {
            b_start = new Date(booking.bookingDetails.pickupDate);
            b_end = new Date(booking.bookingDetails.dropoffDate);
          }

          if (isNaN(b_start.getTime()) || isNaN(b_end.getTime())) return;

          const [bp_h, bp_m] = booking.bookingDetails.pickupTime.split(':').map(Number);
          b_start.setHours(bp_h, bp_m, 0, 0);

          const [bd_h, bd_m] = booking.bookingDetails.dropoffTime.split(':').map(Number);
          b_end.setHours(bd_h, bd_m, 0, 0);

          if (areIntervalsOverlapping(
            { start, end },
            { start: b_start, end: b_end }
          )) {
            busyIds.push(booking.bike.id);
          }
        });

        setUnavailableBikeIds(busyIds);
      } catch (error) {
        console.error('Error checking fleet availability:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [bookingDetails]);

  const displayBikes = [
    ...dbBikes,
    ...BIKES.filter(b => !dbBikes.some(db => db.id === b.id))
  ];

  const categories = ['All', 'Scooter', 'Sport', 'Cruiser', 'Electric', 'Adventure'];

  const filteredBikes = displayBikes.filter(bike => {
    const categoryMatch = activeTab === 'All' || bike.type === activeTab;
    const locationMatch = activeLocation === 'All' || bike.locations?.includes(activeLocation);
    const statusMatch = bike.status === 'available' || !bike.status;
    const availabilityMatch = !unavailableBikeIds.includes(bike.id);
    return categoryMatch && locationMatch && statusMatch && availabilityMatch;
  });

  if (loading && dbBikes.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Fleet...</p>
      </div>
    );
  }

  return (
    <section id="explore" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 tracking-tight">Our Premium Fleet</h2>
            <p className="text-gray-500 max-w-md font-medium">
              Choose from our wide range of well-maintained vehicles. From city scooters to powerful cruisers.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {bookingDetails.pickupLocation && (
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
                {isCheckingAvailability ? (
                  <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />
                ) : (
                  <Info className="w-4 h-4 text-brand-orange" />
                )}
                <span className="text-xs font-bold text-brand-orange">
                  {isCheckingAvailability 
                    ? "Checking real-time availability..." 
                    : `Showing bikes available for ${bookingDetails.pickupDate?.toLocaleDateString()} - ${bookingDetails.dropoffDate?.toLocaleDateString()}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Category:</span>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <TabsList className="bg-transparent h-auto p-0">
                  {categories.map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-brand-orange data-[state=active]:text-white"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Location:</span>
              <div className="flex gap-2">
                {['All', ...LOCATIONS].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setActiveLocation(loc)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeLocation === loc 
                        ? 'bg-brand-dark text-white border-brand-dark' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredBikes.length > 6 && (
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">View:</span>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-orange'}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('carousel')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'carousel' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-orange'}`}
                    title="Carousel View"
                  >
                    <GalleryHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredBikes.length > 0 ? (
          (viewMode === 'carousel' && filteredBikes.length > 6) ? (
            <div className="relative">
              <div className="flex gap-8 overflow-x-auto pb-12 pt-4 px-4 -mx-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
                {filteredBikes.map((bike, index) => (
                  <motion.div
                    key={bike.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] snap-center"
                  >
                    <BikeCard bike={bike} onBook={onBook} priority={index < 4} />
                  </motion.div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-12 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none hidden md:block" />
              <div className="absolute left-0 top-0 bottom-12 w-24 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none hidden md:block" />
              <div className="flex justify-center mt-4 md:hidden">
                <div className="flex gap-2">
                  <div className="w-8 h-1 bg-brand-orange/20 rounded-full">
                    <div className="w-1/3 h-full bg-brand-orange rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-gray-200" />
                Scroll to explore full fleet ({filteredBikes.length} bikes)
                <span className="w-8 h-px bg-gray-200" />
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBikes.map((bike, index) => (
                <motion.div
                  key={bike.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BikeCard bike={bike} onBook={onBook} priority={index < 3} />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">No bikes found in this category for the selected location.</p>
          </div>
        )}
      </div>
    </section>
  );
}
