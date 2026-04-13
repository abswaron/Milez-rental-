import { format } from 'date-fns';

// Mock data for booked slots
// Format: { "YYYY-MM-DD": ["HH:mm", "HH:mm"] }
const MOCK_BOOKED_SLOTS: Record<string, string[]> = {
  [format(new Date(), 'yyyy-MM-dd')]: ['09:00', '10:00', '14:30', '15:00'],
  [format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')]: ['11:00', '11:30', '12:00'],
  // Simulate a fully booked day (assuming 48 slots of 30 mins, but let's just say a few are left)
  [format(new Date(Date.now() + 172800000), 'yyyy-MM-dd')]: Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const min = (i % 2 === 0 ? '00' : '30');
    return `${hour}:${min}`;
  }).filter((_, i) => i !== 20) // Only one slot left at 10:00
};

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function isTimeSlotAvailable(date: Date | undefined, time: string): boolean {
  if (!date) return true;
  const dateStr = format(date, 'yyyy-MM-dd');
  const bookedTimes = MOCK_BOOKED_SLOTS[dateStr] || [];
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
