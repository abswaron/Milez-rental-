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
  description?: string;
  status?: 'available' | 'maintenance' | 'retired';
}

export interface Booking {
  id: string;
  userId: string;
  bike: Partial<Bike>;
  bookingDetails: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    dropoffDate: string;
    dropoffTime: string;
  };
  userDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  documents?: {
    licenseUrl?: string;
    idProofUrl?: string;
  };
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'online' | 'store';
  timestamp: any;
}

export interface BookingDetails {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date | undefined;
  pickupTime: string;
  dropoffDate: Date | undefined;
  dropoffTime: string;
}
