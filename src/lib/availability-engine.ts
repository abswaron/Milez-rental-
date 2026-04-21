import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { areIntervalsOverlapping, parse } from 'date-fns';

export async function checkBikeAvailability(
  bikeId: string,
  pickupDate: Date,
  pickupTime: string,
  dropoffDate: Date,
  dropoffTime: string
): Promise<boolean> {
  // Construct start and end dates
  const start = new Date(pickupDate);
  const [p_h, p_m] = pickupTime.split(':').map(Number);
  start.setHours(p_h, p_m, 0, 0);

  const end = new Date(dropoffDate);
  const [d_h, d_m] = dropoffTime.split(':').map(Number);
  end.setHours(d_h, d_m, 0, 0);

  // Query all bookings for this bike across all users
  const bookingsRef = collection(db, 'public_bookings');
  
  const q = query(
    bookingsRef,
    where('bike.id', '==', bikeId),
    where('status', 'in', ['confirmed', 'pending']) // Check both pending and confirmed
  );

  try {
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const booking = doc.data() as any;
      
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

      if (isNaN(b_start.getTime()) || isNaN(b_end.getTime())) continue;
      
      const [bp_h, bp_m] = booking.bookingDetails.pickupTime.split(':').map(Number);
      b_start.setHours(bp_h, bp_m, 0, 0);

      const [bd_h, bd_m] = booking.bookingDetails.dropoffTime.split(':').map(Number);
      b_end.setHours(bd_h, bd_m, 0, 0);

      if (areIntervalsOverlapping(
        { start, end },
        { start: b_start, end: b_end }
      )) {
        return false; // Conflict found
      }
    }
  } catch (error: any) {
    console.error('Error checking availability:', error);
    throw error;
  }

  return true; // No conflicts
}
