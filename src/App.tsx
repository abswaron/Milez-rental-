/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BikeGrid from './components/BikeGrid';
import LocationSection from './components/LocationSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import HowItWorks from './components/HowItWorks';
import { motion, useScroll, useSpring } from 'motion/react';
import { Shield, Clock, Wallet } from 'lucide-react';
import { Bike, BookingDetails } from './types';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: new Date(),
    pickupTime: '09:00',
    dropoffDate: new Date(Date.now() + 86400000),
    dropoffTime: '09:00'
  });

  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookBike = (bike: Bike) => {
    setSelectedBike(bike);
    setIsBookingModalOpen(true);
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Well Maintained',
      desc: 'Every bike undergoes a rigorous 50-point safety check before every rental.'
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Affordable Rates',
      desc: 'Transparent pricing with no hidden charges. Best rates in the market guaranteed.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Easy Booking',
      desc: 'Book your ride in less than 2 minutes with our seamless digital process.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-orange z-[60] origin-left"
        style={{ scaleX }}
      />

      <Navbar />
      
      <main>
        <Hero onSearch={setBookingDetails} />
        
        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {features.map((f, i) => (
                <motion.div 
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4 group"
                >
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange transition-transform group-hover:scale-110 group-hover:rotate-3">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark">{f.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <BikeGrid onBook={handleBookBike} />
        
        <HowItWorks />

        <div id="locations">
          <LocationSection />
        </div>

        <div id="testimonials">
          <Testimonials />
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative rounded-[48px] bg-brand-orange p-12 md:p-24 overflow-hidden shadow-2xl shadow-brand-orange/20">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready for your next adventure?</h2>
                <p className="text-white/80 text-lg mb-12 font-medium">
                  Join thousands of happy riders exploring Tamil Nadu with Milez. Book your bike today and get 10% off on your first ride.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    className="bg-white text-brand-orange px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/5"
                    onClick={() => {
                      const element = document.getElementById('explore');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Book Your Ride
                  </button>
                  <a 
                    href="mailto:support@milez.in"
                    className="bg-brand-dark text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/5 flex items-center justify-center"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BookingModal 
        bike={selectedBike}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingDetails={bookingDetails}
      />

      <Footer />
    </div>
  );
}


