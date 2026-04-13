export interface Bike {
  id: string;
  name: string;
  type: 'Scooter' | 'Sport' | 'Cruiser' | 'Electric';
  pricePerDay: number;
  image: string;
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Gasoline' | 'Electric';
  locations: string[];
  specs: {
    engine?: string;
    range?: string;
    topSpeed?: string;
  };
}

export interface BookingDetails {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date | undefined;
  pickupTime: string;
  dropoffDate: Date | undefined;
  dropoffTime: string;
}
