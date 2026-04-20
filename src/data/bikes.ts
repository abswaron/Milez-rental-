import { Bike } from '../types';

const RENT_LOCATIONS = [
  'Ekkatuthangal,Tamil Nadu',
  'Coimbatore,Tamil Nadu',
  'Ambattur,Tamil Nadu'
];

export const BIKES: Bike[] = [
  {
    id: '1',
    name: 'Suzuki Access 125',
    type: 'Scooter',
    pricePerDay: 499,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '124cc',
      topSpeed: '90 km/h'
    },
    description: 'The Suzuki Access 125 is a popular scooter known for its smooth performance, fuel efficiency, and comfortable ride. Perfect for city commuting and quick errands.'
  },
  {
    id: '2',
    name: 'Royal Enfield Classic 350',
    type: 'Cruiser',
    pricePerDay: 1200,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '349cc',
      topSpeed: '110 km/h'
    },
    description: 'A legendary cruiser that combines timeless design with modern engineering. The Classic 350 offers a relaxed riding position and that iconic thumping sound.'
  },
  {
    id: '3',
    name: 'KTM Duke 250',
    type: 'Sport',
    pricePerDay: 1500,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '248cc',
      topSpeed: '140 km/h'
    },
    description: 'The KTM Duke 250 is a lightweight, powerful streetfighter designed for agility and speed. Ideal for riders who want a thrilling performance in a compact package.'
  },
  {
    id: '4',
    name: 'Ather 450X',
    type: 'Electric',
    pricePerDay: 699,
    image: 'https://images.unsplash.com/photo-1620510625142-b45cbb784397?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Electric',
    locations: [...RENT_LOCATIONS],
    specs: {
      range: '146 km',
      topSpeed: '90 km/h'
    },
    description: 'The Ather 450X is a high-performance electric scooter with smart features, quick acceleration, and a reliable range. Experience the future of urban mobility.'
  },
  {
    id: '5',
    name: 'Yamaha MT-15',
    type: 'Sport',
    pricePerDay: 1100,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '155cc',
      topSpeed: '130 km/h'
    },
    description: 'The Yamaha MT-15 is a hyper-naked street bike with aggressive styling and a punchy engine. It offers exceptional handling and a unique riding experience.'
  },
  {
    id: '6',
    name: 'Honda Activa 6G',
    type: 'Scooter',
    pricePerDay: 450,
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '109cc',
      topSpeed: '85 km/h'
    },
    description: 'The Honda Activa 6G is India’s most trusted scooter, offering unmatched reliability, ease of use, and great mileage. The perfect choice for daily city travel.'
  }
];

export const LOCATIONS = RENT_LOCATIONS;
