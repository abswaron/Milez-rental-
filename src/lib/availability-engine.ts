import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { areIntervalsOverlapping } from 'date-fns';

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
    where('status', '==', 'confirmed')
  );

  try {
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const booking = doc.data() as any;
      
      // Handle potential string dates from Firestore
      const b_start = new Date(booking.bookingDetails.pickupDate);
      const [bp_h, bp_m] = booking.bookingDetails.pickupTime.split(':').map(Number);
      b_start.setHours(bp_h, bp_m, 0, 0);

      const b_end = new Date(booking.bookingDetails.dropoffDate);
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
    if (error.message?.includes('permissions')) {
      console.error('Permission denied for availability check. Ensure firestore.rules allow collectionGroup read.');
    }
    throw error;
  }

  return true; // No conflicts
}
