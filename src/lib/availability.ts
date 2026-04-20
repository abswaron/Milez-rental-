import { format } from 'date-fns';

// Format: { "YYYY-MM-DD": ["HH:mm", "HH:mm"] }
let bookedSlots: Record<string, string[]> = {
  [format(new Date(), 'yyyy-MM-dd')]: ['09:00', '10:00', '14:30', '15:00'],
  [format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')]: ['11:00', '11:30', '12:00'],
};

export function setBookedSlots(newSlots: Record<string, string[]>) {
  bookedSlots = { ...bookedSlots, ...newSlots };
}

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function isTimeSlotAvailable(date: Date | undefined, time: string): boolean {
  if (!date) return true;
  
  const now = new Date();
  const dateStr = format(date, 'yyyy-MM-dd');
  const todayStr = format(now, 'yyyy-MM-dd');
  
  // 1. Check if the time has already passed for today
  if (dateStr === todayStr) {
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(now);
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Disable if slot is in the past
    if (slotTime < now) return false;
  }

  // 2. Check against booked slots (including those from server)
  // Note: Server might send dates in 'PPP' format, we should handle both or unify
  const bookedTimes = bookedSlots[dateStr] || bookedSlots[format(date, 'PPP')] || [];
  return !bookedTimes.includes(time);
}

export function getAvailableTimes(date: Date | undefined): string[] {
  if (!date) return TIME_SLOTS;
  return TIME_SLOTS.filter(time => isTimeSlotAvailable(date, time));
}

export function isDateFullyBooked(date: Date): boolean {
  const availableTimes = getAvailableTimes(date);
  return availableTimes.length === 0;
}

export function isDateDisabled(date: Date): boolean {
  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return true;
  
  // Disable fully booked dates
  return isDateFullyBooked(date);
}
