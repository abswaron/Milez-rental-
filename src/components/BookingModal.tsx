import React, { useState, useEffect } from 'react';
import { Bike, BookingDetails } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { format } from 'date-fns';
import { CheckCircle2, Calendar as CalendarIcon, MapPin, Clock, CreditCard, Zap, Fuel, Loader2, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { isDateDisabled, isTimeSlotAvailable, TIME_SLOTS } from '../lib/availability';
import { checkBikeAvailability } from '../lib/availability-engine';
import { calculatePrice } from '../lib/pricing';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BookingModalProps {
  bike: Bike | null;
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  onBookingSuccess?: () => void;
  onShowLogin?: () => void;
}

export default function BookingModal({ bike, isOpen, onClose, bookingDetails, setBookingDetails, onBookingSuccess, onShowLogin }: BookingModalProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const [documents, setDocuments] = useState({
    license: null as File | null,
    idProof: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'store'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverWarning, setServerWarning] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPickupDateOpen, setIsPickupDateOpen] = useState(false);
  const [isPickupTimeOpen, setIsPickupTimeOpen] = useState(false);
  const [isDropoffDateOpen, setIsDropoffDateOpen] = useState(false);
  const [isDropoffTimeOpen, setIsDropoffTimeOpen] = useState(false);

  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: user?.phoneNumber || profile?.phone || ''
  });

  useEffect(() => {
    const phone = user?.phoneNumber || profile?.phone;
    if (phone) {
      setUserDetails(prev => ({ ...prev, phone }));
    }
  }, [user, profile]);

  if (!bike) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!user) {
      onClose();
      if (onShowLogin) onShowLogin();
      return false;
    }

    // Booking Details Validation
    if (!bookingDetails.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!bookingDetails.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!bookingDetails.pickupTime) newErrors.pickupTime = 'Pickup time is required';
    if (!bookingDetails.dropoffDate) {
      newErrors.dropoffDate = 'Drop-off date is required';
    } else if (bookingDetails.pickupDate) {
      const pDate = new Date(bookingDetails.pickupDate);
      pDate.setHours(0, 0, 0, 0);
      const dDate = new Date(bookingDetails.dropoffDate);
      dDate.setHours(0, 0, 0, 0);
      
      if (dDate < pDate) {
        newErrors.dropoffDate = 'Drop-off cannot be before pickup';
      } else if (dDate.getTime() === pDate.getTime() && bookingDetails.pickupTime && bookingDetails.dropoffTime) {
        const pTimeIdx = TIME_SLOTS.indexOf(bookingDetails.pickupTime);
        const dTimeIdx = TIME_SLOTS.indexOf(bookingDetails.dropoffTime);
        if (dTimeIdx <= pTimeIdx) {
          newErrors.dropoffTime = 'Drop-off time must be after pickup time';
        }
      }
    }
    
    if (!bookingDetails.dropoffTime) newErrors.dropoffTime = 'Drop-off time is required';

    // User Details Validation
    if (!userDetails.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!userDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!userDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setIsSubmitting(true);
        setServerError(null);
        try {
          const isAvailable = await checkBikeAvailability(
            bike.id,
            bookingDetails.pickupDate!,
            bookingDetails.pickupTime,
            bookingDetails.dropoffDate!,
            bookingDetails.dropoffTime
          );

          if (!isAvailable) {
            setServerError('This vehicle is already booked for the selected time slot. Please choose another time or vehicle.');
            return;
          }
          setStep(2);
        } catch (err) {
          console.error('Availability check failed:', err);
          setServerError('Could not verify availability. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    } else if (step === 2) {
      if (!documents.license || !documents.idProof) {
        setServerError('Please upload both your Driving License and ID Proof to continue.');
        return;
      }
      setServerError(null);
      setStep(3);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) e.preventDefault();
    
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    setServerError(null);
    
    try {
      const pricing = calculatePrice(
        bike.pricePerDay, 
        bookingDetails.pickupDate || new Date(), 
        bookingDetails.dropoffDate || new Date(),
        true // Assume first ride
      );

      const formattedBookingDetails = {
        ...bookingDetails,
        pickupDate: bookingDetails.pickupDate ? format(bookingDetails.pickupDate, 'PPP') : 'Not selected',
        dropoffDate: bookingDetails.dropoffDate ? format(bookingDetails.dropoffDate, 'PPP') : 'Not selected',
      };

      const formattedBooking = {
        userId: user.uid,
        bike: {
          id: bike.id,
          name: bike.name,
          image: bike.image,
          type: bike.type,
          pricePerDay: bike.pricePerDay,
          transmission: bike.transmission,
          fuelType: bike.fuelType
        },
        bookingDetails: formattedBookingDetails,
        userDetails: {
          ...userDetails,
          phone: user.phoneNumber // Use verified phone
        },
        timestamp: serverTimestamp(),
        status: paymentMethod === 'online' ? 'pending' : 'confirmed',
        paymentMethod: paymentMethod,
        pricing: {
          basePrice: pricing.basePrice,
          days: pricing.days,
          serviceFee: pricing.serviceFee,
          discount: pricing.discount,
          total: pricing.total
        }
      };

      if (paymentMethod === 'online') {
        // 1. Save to Firestore as pending
        const bookingRef = await addDoc(collection(db, 'users', user.uid, 'bookings'), formattedBooking);
        
        // Save a public version for availability checks (No PII)
        const { userDetails: _, ...publicBooking } = formattedBooking;
        await setDoc(doc(db, 'public_bookings', bookingRef.id), publicBooking);

        const response = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: pricing.total,
            bikeId: bike.id,
            userId: user.uid
          }),
        });

        const order = await response.json();
        if (order.error) throw new Error(order.error);

        const options = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Milez Bike Rentals",
          description: `Rental for ${bike.name}`,
          order_id: order.id,
          handler: async function (response: any) {
            console.log("Payment successful:", response);
            setIsSuccess(true);
            if (onBookingSuccess) onBookingSuccess();
          },
          prefill: {
            name: `${userDetails.firstName} ${userDetails.lastName}`,
            email: userDetails.email,
            contact: user.phoneNumber?.replace(/\s+/g, '') || userDetails.phone?.replace(/\s+/g, ''),
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'UPI / Google Pay / PhonePe',
                  instruments: [
                    {
                      method: 'upi'
                    }
                  ]
                }
              },
              sequence: ['block.upi'],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          theme: {
            color: "#F27D26",
          },
          modal: {
            ondismiss: function() {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // 1. Save to Firestore (for store payment)
      if (paymentMethod === 'store') {
        const bookingRef = await addDoc(collection(db, 'users', user.uid, 'bookings'), formattedBooking);
        
        // Save a public version for availability checks (No PII)
        const { userDetails: _, ...publicBooking } = formattedBooking;
        await setDoc(doc(db, 'public_bookings', bookingRef.id), publicBooking);
      }

      // 2. Send confirmation email (only for store payment, online handled by webhook)
      if (paymentMethod === 'store') {
        try {
          const response = await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bike,
              bookingDetails: formattedBooking.bookingDetails,
              userDetails: formattedBooking.userDetails
            }),
          });
          
          const result = await response.json();
          if (result.warning) {
            setServerWarning(result.warning);
          }
        } catch (emailErr) {
          console.error('Email sending failed:', emailErr);
          setServerWarning('Booking confirmed, but we couldn\'t send the confirmation email.');
        }
      }

      setIsSuccess(true);
      if (onBookingSuccess) onBookingSuccess();
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      setServerError(error.message || 'An error occurred while processing your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setIsSuccess(false);
    setServerWarning(null);
    setServerError(null);
    setUserDetails({ firstName: '', lastName: '', email: '', phone: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="w-[95vw] max-w-[500px] rounded-[24px] md:rounded-[32px] overflow-hidden p-0 max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 md:py-12 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">Booking Confirmed!</h2>
                <p className="text-sm md:text-base text-gray-500 mb-4">Your ride is ready. Check your email for details.</p>
                
                {serverWarning && (
                  <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-left">
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mb-1">Note</p>
                    <p className="text-xs text-orange-800 leading-relaxed">{serverWarning}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      resetAndClose();
                      document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl px-8"
                  >
                    View My Bookings
                  </Button>
                  <Button onClick={resetAndClose} variant="outline" className="rounded-xl px-8">
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl md:text-2xl font-bold">Book Your {bike.name}</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Complete the details below to secure your rental.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                  {/* Bike Summary Header */}
                  <div className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={bike.image} 
                        alt={bike.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] md:text-[10px] font-black bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase tracking-wider">
                          {bike.type}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-brand-dark truncate">{bike.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-brand-orange" />
                          {bike.transmission}
                        </div>
                        <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Fuel className="w-2.5 h-2.5 md:w-3 md:h-3 text-brand-orange" />
                          {bike.fuelType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-gray-50 p-1.5 md:p-2 rounded-xl border border-gray-100 text-center">
                      <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Engine/Range</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-brand-dark truncate">{bike.specs?.engine || bike.specs?.range || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-1.5 md:p-2 rounded-xl border border-gray-100 text-center">
                      <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Top Speed</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-brand-dark">{bike.specs?.topSpeed || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-1.5 md:p-2 rounded-xl border border-gray-100 text-center">
                      <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Price/Day</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-brand-orange">₹{bike.pricePerDay}</p>
                    </div>
                  </div>

                  {bike.description && (
                    <div className="mb-6">
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">About this vehicle</p>
                      <div className="bg-gray-50/50 p-3 md:p-4 rounded-2xl border border-gray-100 italic text-[11px] md:text-xs text-gray-600 leading-relaxed">
                        "{bike.description}"
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      {serverError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-600">Availability Issue</p>
                            <p className="text-xs text-red-500 leading-relaxed">{serverError}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className={`bg-gray-50 p-3 md:p-4 rounded-2xl ${errors.pickupLocation ? 'border border-red-500 bg-red-50' : ''}`}>
                          <div className="flex items-center justify-between text-[11px] md:text-xs">
                            <span className="text-gray-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Rent Location</span>
                            <span className="font-bold text-brand-dark">{bookingDetails.pickupLocation || 'Not selected'}</span>
                          </div>
                        </div>
                        {errors.pickupLocation && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.pickupLocation}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className={`bg-gray-50 p-3 md:p-4 rounded-2xl space-y-3 ${errors.pickupDate || errors.pickupTime ? 'border border-red-500 bg-red-50' : ''}`}>
                            <h4 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</h4>
                            <div className="flex items-center justify-between text-[11px] md:text-xs">
                              <span className="text-gray-500 flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> Date</span>
                              <Popover open={isPickupDateOpen} onOpenChange={setIsPickupDateOpen}>
                                <PopoverTrigger render={
                                  <button className={`font-bold transition-colors ${errors.pickupDate ? 'text-red-500' : 'text-brand-dark hover:text-brand-orange'}`}>
                                    {bookingDetails.pickupDate ? format(bookingDetails.pickupDate, 'MMM dd, yyyy') : 'Select Date'}
                                  </button>
                                } />
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar
                                    mode="single"
                                    selected={bookingDetails.pickupDate}
                                    onSelect={(date) => {
                                      setBookingDetails(prev => ({ ...prev, pickupDate: date }));
                                      if (errors.pickupDate) setErrors(prev => ({ ...prev, pickupDate: '' }));
                                      setIsPickupDateOpen(false);
                                    }}
                                    disabled={isDateDisabled}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex items-center justify-between text-[11px] md:text-xs">
                              <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</span>
                              <Popover open={isPickupTimeOpen} onOpenChange={setIsPickupTimeOpen}>
                                <PopoverTrigger render={
                                  <button className={`font-bold transition-colors ${errors.pickupTime ? 'text-red-500' : 'text-brand-dark hover:text-brand-orange'}`}>
                                    {bookingDetails.pickupTime || 'Select Time'}
                                  </button>
                                } />
                                <PopoverContent className="w-[280px] p-4" align="end">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Pickup Time</p>
                                      <Clock className="w-3 h-3 text-brand-orange" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                      {TIME_SLOTS.map(time => {
                                        const isAvailable = isTimeSlotAvailable(bookingDetails.pickupDate, time);
                                        const isSelected = bookingDetails.pickupTime === time;
                                        return (
                                          <button
                                            key={time}
                                            disabled={!isAvailable}
                                            onClick={() => {
                                              setBookingDetails(prev => ({ ...prev, pickupTime: time }));
                                              if (errors.pickupTime) setErrors(prev => ({ ...prev, pickupTime: '' }));
                                              setIsPickupTimeOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                              isSelected 
                                                ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
                                                : isAvailable 
                                                  ? 'bg-gray-50 text-brand-dark hover:bg-gray-100' 
                                                  : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
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
                            </div>
                          </div>
                          {errors.pickupDate && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.pickupDate}</p>}
                          {!errors.pickupDate && errors.pickupTime && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.pickupTime}</p>}
                        </div>

                        <div className="space-y-1">
                          <div className={`bg-gray-50 p-3 md:p-4 rounded-2xl space-y-3 ${errors.dropoffDate || errors.dropoffTime ? 'border border-red-500 bg-red-50' : ''}`}>
                            <h4 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Drop-off</h4>
                            <div className="flex items-center justify-between text-[11px] md:text-xs">
                              <span className="text-gray-500 flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> Date</span>
                              <Popover open={isDropoffDateOpen} onOpenChange={setIsDropoffDateOpen}>
                                <PopoverTrigger render={
                                  <button className={`font-bold transition-colors ${errors.dropoffDate ? 'text-red-500' : 'text-brand-dark hover:text-brand-orange'}`}>
                                    {bookingDetails.dropoffDate ? format(bookingDetails.dropoffDate, 'MMM dd, yyyy') : 'Select Date'}
                                  </button>
                                } />
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar
                                    mode="single"
                                    selected={bookingDetails.dropoffDate}
                                    onSelect={(date) => {
                                      setBookingDetails(prev => ({ ...prev, dropoffDate: date }));
                                      if (errors.dropoffDate) setErrors(prev => ({ ...prev, dropoffDate: '' }));
                                      setIsDropoffDateOpen(false);
                                    }}
                                    disabled={isDateDisabled}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex items-center justify-between text-[11px] md:text-xs">
                              <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</span>
                              <Popover open={isDropoffTimeOpen} onOpenChange={setIsDropoffTimeOpen}>
                                <PopoverTrigger render={
                                  <button className={`font-bold transition-colors ${errors.dropoffTime ? 'text-red-500' : 'text-brand-dark hover:text-brand-orange'}`}>
                                    {bookingDetails.dropoffTime || 'Select Time'}
                                  </button>
                                } />
                                <PopoverContent className="w-[280px] p-4" align="end">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Drop-off Time</p>
                                      <Clock className="w-3 h-3 text-brand-orange" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                      {TIME_SLOTS.map(time => {
                                        const isAvailable = isTimeSlotAvailable(bookingDetails.dropoffDate, time);
                                        const isSelected = bookingDetails.dropoffTime === time;
                                        return (
                                          <button
                                            key={time}
                                            disabled={!isAvailable}
                                            onClick={() => {
                                              setBookingDetails(prev => ({ ...prev, dropoffTime: time }));
                                              if (errors.dropoffTime) setErrors(prev => ({ ...prev, dropoffTime: '' }));
                                              setIsDropoffTimeOpen(false);
                                            }}
                                            className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                              isSelected 
                                                ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
                                                : isAvailable 
                                                  ? 'bg-gray-50 text-brand-dark hover:bg-gray-100' 
                                                  : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
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
                            </div>
                          </div>
                          {errors.dropoffDate && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.dropoffDate}</p>}
                          {!errors.dropoffDate && errors.dropoffTime && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.dropoffTime}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className={`text-xs md:text-sm ${errors.firstName ? "text-red-500" : ""}`}>First Name</Label>
                            <Input 
                              id="firstName" 
                              placeholder="John" 
                              className={`rounded-xl h-10 md:h-11 text-sm ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              value={userDetails.firstName}
                              onChange={(e) => {
                                setUserDetails({ ...userDetails, firstName: e.target.value });
                                if (errors.firstName) setErrors({ ...errors, firstName: '' });
                              }}
                            />
                            {errors.firstName && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.firstName}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className={`text-xs md:text-sm ${errors.lastName ? "text-red-500" : ""}`}>Last Name</Label>
                            <Input 
                              id="lastName" 
                              placeholder="Doe" 
                              className={`rounded-xl h-10 md:h-11 text-sm ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              value={userDetails.lastName}
                              onChange={(e) => {
                                setUserDetails({ ...userDetails, lastName: e.target.value });
                                if (errors.lastName) setErrors({ ...errors, lastName: '' });
                              }}
                            />
                            {errors.lastName && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.lastName}</p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className={`text-xs md:text-sm ${errors.email ? "text-red-500" : ""}`}>Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="john@example.com" 
                            className={`rounded-xl h-10 md:h-11 text-sm ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            value={userDetails.email}
                            onChange={(e) => {
                              setUserDetails({ ...userDetails, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                          />
                          {errors.email && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className={`text-xs md:text-sm ${errors.phone ? "text-red-500" : ""}`}>Verified Phone Number</Label>
                          <div className="relative">
                            <Input 
                              id="phone" 
                              type="tel" 
                              placeholder="+91 98765 43210" 
                              className={`rounded-xl h-10 md:h-11 text-sm bg-gray-50 cursor-not-allowed ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              value={userDetails.phone}
                              readOnly
                            />
                            {user && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <CheckCircle2 className="w-3 h-3" />
                                VERIFIED
                              </div>
                            )}
                          </div>
                          {errors.phone && <p className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.phone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {serverError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-600 font-medium">{serverError}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark mb-4">Document Verification (KYC)</h4>
                        <p className="text-xs text-gray-500 mb-6">Please upload clear photos of your documents for verification. Max size 5MB.</p>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Driving License</Label>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setDocuments(prev => ({ ...prev, license: e.target.files?.[0] || null }))}
                                className="hidden" 
                                id="license-upload"
                              />
                              <label 
                                htmlFor="license-upload"
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                  documents.license ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-brand-orange bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${documents.license ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-brand-dark">{documents.license ? 'License Uploaded' : 'Upload License'}</p>
                                    <p className="text-[10px] text-gray-400">{documents.license ? documents.license.name : 'Front side of your DL'}</p>
                                  </div>
                                </div>
                                {!documents.license && <Plus className="w-5 h-5 text-gray-300" />}
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID Proof (Aadhar/Voter ID)</Label>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setDocuments(prev => ({ ...prev, idProof: e.target.files?.[0] || null }))}
                                className="hidden" 
                                id="id-upload"
                              />
                              <label 
                                htmlFor="id-upload"
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                  documents.idProof ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-brand-orange bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${documents.idProof ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-brand-dark">{documents.idProof ? 'ID Proof Uploaded' : 'Upload ID Proof'}</p>
                                    <p className="text-[10px] text-gray-400">{documents.idProof ? documents.idProof.name : 'Front side of your ID'}</p>
                                  </div>
                                </div>
                                {!documents.idProof && <Plus className="w-5 h-5 text-gray-300" />}
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      {serverError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Booking Error</p>
                          <p className="text-xs text-red-800">{serverError}</p>
                        </div>
                      )}
                      {(() => {
                        const pricing = calculatePrice(
                          bike.pricePerDay, 
                          bookingDetails.pickupDate || new Date(), 
                          bookingDetails.dropoffDate || new Date(),
                          true // Assume first ride for demo
                        );
                        return (
                          <div className="bg-brand-dark text-white p-5 md:p-6 rounded-2xl">
                            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Price Summary ({pricing.days} {pricing.days === 1 ? 'Day' : 'Days'})</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="opacity-70">Base Rental Fee</span>
                                <span className="font-bold">₹{pricing.basePrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Service Fee</span>
                                <span className="font-bold">₹{pricing.serviceFee}</span>
                              </div>
                              {pricing.discount > 0 && (
                                <div className="flex justify-between text-green-400">
                                  <span className="opacity-70">Discount</span>
                                  <span className="font-bold">-₹{pricing.discount}</span>
                                </div>
                              )}
                              <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-lg md:text-xl">
                                <span>Total</span>
                                <span className="text-brand-orange">₹{pricing.total}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-4">
                        <Label className="text-xs md:text-sm font-bold">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <button 
                            onClick={() => setPaymentMethod('online')}
                            className={`p-3 md:p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                              paymentMethod === 'online' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <CreditCard className={`w-5 h-5 md:w-6 md:h-6 ${paymentMethod === 'online' ? 'text-brand-orange' : 'text-gray-400'}`} />
                            <span className="text-[10px] md:text-xs font-bold">Pay Online</span>
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('store')}
                            className={`p-3 md:p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                              paymentMethod === 'store' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <MapPin className={`w-5 h-5 md:w-6 md:h-6 ${paymentMethod === 'store' ? 'text-brand-orange' : 'text-gray-400'}`} />
                            <span className="text-[10px] md:text-xs font-bold">Pay at Store</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-8 flex flex-row gap-3">
                  {step > 1 && (
                    <Button variant="ghost" onClick={handleBack} disabled={isSubmitting} className="flex-1 rounded-xl">
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button onClick={handleNext} disabled={isSubmitting} className="bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl flex-1 px-8">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl flex-[2] px-8"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                    </Button>
                  )}
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
