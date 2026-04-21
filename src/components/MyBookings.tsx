import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Loader2, 
  LogOut, 
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import ReceiptModal from './ReceiptModal';
import LoginView from './LoginView';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function MyBookings() {
  const { user, logout, isAuthReady } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'users', user.uid, 'bookings'),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to Date
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setBookings(fetchedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const handleCancelBooking = async () => {
    if (!user || !bookingToCancel) return;

    const booking = bookings.find(b => b.id === bookingToCancel);
    if (!booking) return;

    setIsCancelling(bookingToCancel);
    try {
      // 1. Calculate Refund Amount based on policy
      // Policy: >24h = 100%, 6-24h = 50%, <6h = 0%
      const pickupDate = new Date(booking.bookingDetails.pickupDate);
      const [h, m] = booking.bookingDetails.pickupTime.split(':').map(Number);
      pickupDate.setHours(h, m, 0, 0);
      
      const now = new Date();
      const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let refundPercentage = 0;
      if (hoursUntilPickup > 24) refundPercentage = 1;
      else if (hoursUntilPickup >= 6) refundPercentage = 0.5;

      const totalPaid = booking.pricing?.total || (booking.bike.pricePerDay + 99);
      const refundAmount = Math.floor(totalPaid * refundPercentage);

      // 2. Process Refund if applicable and paid online
      let refundId = null;
      if (refundAmount > 0 && booking.paymentMethod === 'online' && booking.razorpayPaymentId) {
        const refundResponse = await fetch('/api/refund-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: booking.razorpayPaymentId,
            amount: refundAmount,
            bookingId: booking.id,
            userId: user.uid
          })
        });
        const refundData = await refundResponse.json();
        if (refundData.success) {
          refundId = refundData.refundId;
        }
      }

      // 3. Update Firestore
      const bookingRef = doc(db, 'users', user.uid, 'bookings', bookingToCancel);
      const updateData = {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        refundDetails: {
          amount: refundAmount,
          percentage: refundPercentage * 100,
          refundId: refundId,
          processedAt: refundId ? new Date().toISOString() : null
        }
      };
      
      await updateDoc(bookingRef, updateData);

      // Also update public version for availability
      try {
        const publicRef = doc(db, 'public_bookings', bookingToCancel);
        await updateDoc(publicRef, { status: 'cancelled' });
      } catch (e) {
        console.warn('Could not update public booking status:', e);
      }
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingToCancel ? { 
        ...b, 
        status: 'cancelled',
        refundDetails: { amount: refundAmount, percentage: refundPercentage * 100 }
      } : b));
      
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setBookings([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <section id="my-bookings" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">My Bookings</h2>
          <p className="text-gray-500">
            {user 
              ? `Showing bookings for ${user.phoneNumber || 'Guest User'}`
              : "Verify your mobile number to view your current and past rental details."
            }
          </p>
        </div>

        {!user ? (
          <Card className="p-6 md:p-8 rounded-[32px] border-none shadow-xl bg-white mb-12 max-w-md mx-auto">
            <LoginView />
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
                <p className="text-gray-500 font-medium">Fetching your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 rounded-[32px] border-none shadow-lg bg-white text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">No bookings found</h3>
                <p className="text-gray-500">You haven't made any bookings yet. Start your journey today!</p>
                <Button 
                  className="mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl px-8"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Book a Bike
                </Button>
              </Card>
            ) : (
              <div className={`grid gap-6 ${bookings.length > 3 ? 'max-h-[800px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                <AnimatePresence mode="popLayout">
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 rounded-[32px] border-none shadow-md bg-white hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          {/* Image Section */}
                          <div className="w-full md:w-48 h-40 rounded-2xl overflow-hidden bg-gray-50 relative shrink-0">
                            <img 
                              src={booking.bike.image} 
                              alt={booking.bike.name}
                              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Status Badge - Moved inside image for better mobile layout */}
                            <div className="absolute top-2 left-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                                booking.status === 'completed' ? 'bg-blue-500 text-white' :
                                booking.status === 'pending' ? 'bg-yellow-500 text-white' :
                                booking.status === 'cancelled' ? 'bg-red-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Details Section */}
                          <div className="flex-1 space-y-4 w-full">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-brand-dark">{booking.bike.name}</h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Booked on {booking.timestamp.toLocaleDateString()} at {booking.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Paid</p>
                                <p className="text-2xl font-black text-brand-orange">₹{booking.pricing?.total || (booking.bike.pricePerDay + 99)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl">
                              <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Pickup
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                                    <Calendar className="w-4 h-4 text-brand-orange" />
                                    <span>{booking.bookingDetails.pickupDate} at {booking.bookingDetails.pickupTime}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                    <span className="leading-tight">{booking.bookingDetails.pickupLocation}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Drop-off
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                                    <Calendar className="w-4 h-4 text-brand-orange" />
                                    <span>{booking.bookingDetails.dropoffDate} at {booking.bookingDetails.dropoffTime}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                    <span className="leading-tight">{booking.bookingDetails.dropoffLocation}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {booking.status === 'cancelled' && booking.refundDetails && (
                              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Refund Processed</p>
                                  <p className="text-sm font-medium text-red-700">
                                    {booking.refundDetails.amount > 0 
                                      ? `₹${booking.refundDetails.amount} (${booking.refundDetails.percentage}% refund) credited to source.` 
                                      : "No refund applicable for this cancellation window."}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-3 pt-2">
                              <Button 
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsReceiptOpen(true);
                                }}
                                className="rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white px-6 h-11 flex-1 sm:flex-none"
                              >
                                View Receipt
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                              {booking.status === 'confirmed' && (
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setBookingToCancel(booking.id);
                                    setIsCancelModalOpen(true);
                                  }}
                                  disabled={isCancelling === booking.id}
                                  className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 h-11 px-6 flex-1 sm:flex-none"
                                >
                                  {isCancelling === booking.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Cancel Booking
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {selectedBooking && (
          <ReceiptModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            booking={selectedBooking}
          />
        )}

        {/* Cancellation Confirmation Modal */}
        <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <AlertDialogContent className="rounded-[32px] border-none shadow-2xl max-w-md">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-center text-brand-dark">
                Cancel Booking?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-500 text-base">
                Are you sure you want to cancel this booking? This action cannot be undone and cancellation fees may apply according to our policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
              <AlertDialogCancel 
                variant="outline"
                size="default"
                className="rounded-2xl h-14 border-gray-100 hover:bg-gray-50 text-gray-600 font-bold flex-1"
              >
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleCancelBooking();
                }}
                className="rounded-2xl h-14 bg-red-500 hover:bg-red-600 text-white font-bold flex-1 shadow-lg shadow-red-500/20"
                disabled={!!isCancelling}
              >
                {isCancelling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Yes, Cancel"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
