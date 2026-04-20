import { differenceInDays } from 'date-fns';

export interface PriceBreakdown {
  basePrice: number;
  days: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export function calculatePrice(
  pricePerDay: number,
  pickupDate: Date,
  dropoffDate: Date,
  isFirstRide: boolean = false
): PriceBreakdown {
  // Ensure at least 1 day
  const diff = differenceInDays(dropoffDate, pickupDate);
  const days = Math.max(diff, 1);
  
  const basePrice = pricePerDay * days;
  const serviceFee = 99;
  
  // 10% discount for first ride
  let discount = isFirstRide ? Math.round(basePrice * 0.1) : 0;
  
  // Long duration discount (7+ days)
  if (days >= 7 && !isFirstRide) {
    discount = Math.round(basePrice * 0.15);
  }

  const total = basePrice + serviceFee - discount;

  return {
    basePrice,
    days,
    serviceFee,
    discount,
    total
  };
}
