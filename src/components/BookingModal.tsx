import React, { useState } from 'react';
import { Bike, BookingDetails } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { format } from 'date-fns';
import { CheckCircle2, Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  bike: Bike | null;
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails;
}

export default function BookingModal({ bike, isOpen, onClose, bookingDetails }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  if (!bike) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!userDetails.email || !userDetails.firstName || !userDetails.phone) {
      alert("Please fill in all required contact details in Step 1.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting booking for:", userDetails.email);
    
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bike,
          bookingDetails: {
            ...bookingDetails,
            pickupDate: bookingDetails.pickupDate ? format(bookingDetails.pickupDate, 'PPP') : 'Not selected',
            dropoffDate: bookingDetails.dropoffDate ? format(bookingDetails.dropoffDate, 'PPP') : 'Not selected',
          },
          userDetails
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse server response:', parseError);
        throw new Error('The server returned an invalid response. Please try again.');
      }
      
      if (result.success) {
        console.log("Booking successful!");
        if (result.warning) {
          console.warn("Booking Warning:", result.warning);
          alert(`Booking Successful!\n\nNote: ${result.warning}`);
        }
        setIsSuccess(true);
      } else {
        console.error('Booking failed:', result.error);
        const errorMessage = result.details 
          ? `${result.error}\n\n${result.details}`
          : result.error;
        alert(`Booking Error: ${errorMessage || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while connecting to the server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setIsSuccess(false);
    setUserDetails({ firstName: '', lastName: '', email: '', phone: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] overflow-hidden">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-brand-dark mb-2">Booking Confirmed!</h2>
              <p className="text-gray-500 mb-8">Your ride is ready. Check your email for details.</p>
              <Button onClick={resetAndClose} className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl px-8">
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Book Your {bike.name}</DialogTitle>
                <DialogDescription>
                  Complete the details below to secure your rental.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</span>
                          <span className="font-bold text-brand-dark">{bookingDetails.pickupLocation || 'Not selected'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</span>
                          <span className="font-bold text-brand-dark">
                            {bookingDetails.pickupDate ? format(bookingDetails.pickupDate, 'MMM dd, yyyy') : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</span>
                          <span className="font-bold text-brand-dark">{bookingDetails.pickupTime}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Drop-off</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</span>
                          <span className="font-bold text-brand-dark">{bookingDetails.dropoffLocation || 'Not selected'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</span>
                          <span className="font-bold text-brand-dark">
                            {bookingDetails.dropoffDate ? format(bookingDetails.dropoffDate, 'MMM dd, yyyy') : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</span>
                          <span className="font-bold text-brand-dark">{bookingDetails.dropoffTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            placeholder="John" 
                            className="rounded-xl" 
                            value={userDetails.firstName}
                            onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Doe" 
                            className="rounded-xl" 
                            value={userDetails.lastName}
                            onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@example.com" 
                          className="rounded-xl" 
                          value={userDetails.email}
                          onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+91 98765 43210" 
                          className="rounded-xl" 
                          value={userDetails.phone}
                          onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-brand-dark text-white p-6 rounded-2xl">
                      <h4 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">Price Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Rental Fee</span>
                          <span>₹{bike.pricePerDay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Fee</span>
                          <span>₹99</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-xl">
                          <span>Total</span>
                          <span className="text-brand-orange">₹{bike.pricePerDay + 99}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-bold">Payment Method</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border-2 border-brand-orange rounded-xl flex flex-col items-center gap-2 bg-brand-orange/5">
                          <CreditCard className="w-6 h-6 text-brand-orange" />
                          <span className="text-xs font-bold">Pay Online</span>
                        </button>
                        <button className="p-4 border-2 border-gray-100 rounded-xl flex flex-col items-center gap-2 hover:border-gray-200">
                          <MapPin className="w-6 h-6 text-gray-400" />
                          <span className="text-xs font-bold">Pay at Store</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-8 gap-3 sm:gap-0">
                {step === 2 && (
                  <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                    Back
                  </Button>
                )}
                {step === 1 ? (
                  <Button onClick={handleNext} className="bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl w-full sm:w-auto px-8">
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl w-full sm:w-auto px-8"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                )}
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
