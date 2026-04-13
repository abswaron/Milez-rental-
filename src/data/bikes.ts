import { Bike } from '../types';

export const BIKES: Bike[] = [
  {
    id: '1',
    name: 'Suzuki Access 125',
    type: 'Scooter',
    pricePerDay: 499,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: ['Chennai', 'Coimbatore', 'Ooty'],
    specs: {
      engine: '124cc',
      topSpeed: '90 km/h'
    }
  },
  {
    id: '2',
    name: 'Royal Enfield Classic 350',
    type: 'Cruiser',
    pricePerDay: 1200,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: ['Chennai', 'Coimbatore', 'Ooty'],
    specs: {
      engine: '349cc',
      topSpeed: '110 km/h'
    }
  },
  {
    id: '3',
    name: 'KTM Duke 250',
    type: 'Sport',
    pricePerDay: 1500,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: ['Chennai', 'Coimbatore'],
    specs: {
      engine: '248cc',
      topSpeed: '140 km/h'
    }
  },
  {
    id: '4',
    name: 'Ather 450X',
    type: 'Electric',
    pricePerDay: 699,
    image: 'https://images.unsplash.com/photo-1620510625142-b45cbb784397?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Electric',
    locations: ['Chennai', 'Coimbatore'],
    specs: {
      range: '146 km',
      topSpeed: '90 km/h'
    }
  },
  {
    id: '5',
    name: 'Yamaha MT-15',
    type: 'Sport',
    pricePerDay: 1100,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: ['Chennai', 'Coimbatore', 'Ooty'],
    specs: {
      engine: '155cc',
      topSpeed: '130 km/h'
    }
  },
  {
    id: '6',
    name: 'Honda Activa 6G',
    type: 'Scooter',
    pricePerDay: 450,
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: ['Chennai', 'Coimbatore', 'Ooty'],
    specs: {
      engine: '109cc',
      topSpeed: '85 km/h'
    }
  }
];

export const LOCATIONS = ['Chennai', 'Coimbatore', 'Ooty'];
