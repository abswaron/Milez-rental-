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
    image: 'https://images.unsplash.com/photo-1558981359-219d6364c96f?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '109cc',
      topSpeed: '85 km/h'
    },
    description: 'The Honda Activa 6G is India’s most trusted scooter, offering unmatched reliability, ease of use, and great mileage. The perfect choice for daily city travel.'
  },
  {
    id: '7',
    name: 'Royal Enfield Himalayan',
    type: 'Adventure',
    pricePerDay: 1500,
    image: 'https://images.unsplash.com/photo-1574044957640-1e5b4b726cb3?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '411cc',
      topSpeed: '120 km/h'
    },
    description: 'The Royal Enfield Himalayan is built for the rough roads and mountain trails. With high ground clearance and long-travel suspension, it is the ultimate companion for long-distance adventure touring.'
  },
  {
    id: '8',
    name: 'TVS Jupiter 125',
    type: 'Scooter',
    pricePerDay: 550,
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '124cc',
      topSpeed: '95 km/h'
    },
    description: 'TVS Jupiter 125 is known for its "Zyada" space and comfort. It features a large under-seat storage and great ergonomics, making it a premium choice for families and commuters.'
  },
  {
    id: '9',
    name: 'Bajaj Pulsar NS200',
    type: 'Sport',
    pricePerDay: 850,
    image: 'https://images.unsplash.com/photo-1644781744161-558614539dfd?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '199cc',
      topSpeed: '136 km/h'
    },
    description: 'The Pulsar NS200 is a raw streetfighter with a high-revving liquid-cooled engine. It offers aggressive power delivery and a perimeter frame for precision handling in city traffic.'
  },
  {
    id: '10',
    name: 'Ola S1 Pro',
    type: 'Electric',
    pricePerDay: 750,
    image: 'https://images.unsplash.com/photo-1621334969234-5231c828d173?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Electric',
    locations: [...RENT_LOCATIONS],
    specs: {
      range: '181 km',
      topSpeed: '116 km/h'
    },
    description: 'The Ola S1 Pro Gen 2 is India’s leading electric scooter, featuring incredible acceleration, massive range, and a futuristic tech-enabled experience with proximity unlock and music.'
  },
  {
    id: '11',
    name: 'Honda Hness CB350',
    type: 'Cruiser',
    pricePerDay: 1300,
    image: 'https://images.unsplash.com/photo-1594142830831-7bc77c5f87b8?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '348cc',
      topSpeed: '120 km/h'
    },
    description: 'The Honda Hness CB350 brings a majestic Presence and traditional retro design with modern features. Its smooth engine and assist slipper clutch make for a premium cruising experience.'
  },
  {
    id: '12',
    name: 'BMW G 310 GS',
    type: 'Adventure',
    pricePerDay: 2500,
    image: 'https://images.unsplash.com/photo-1581451030386-db9f5fa44b3c?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '313cc',
      topSpeed: '143 km/h'
    },
    description: 'The BMW G 310 GS is the perfect introduction to the world of adventure. It’s light, nimble, and ready for both suburban roads and light off-road trails with BMW’s legendary build quality.'
  },
  {
    id: '13',
    name: 'Yamaha R15 V4',
    type: 'Sport',
    pricePerDay: 1600,
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '155cc',
      topSpeed: '145 km/h'
    },
    description: 'The Yamaha R15 V4 is a miniature superbike. With VVA technology, Traction Control, and a Quick Shifter, it provides a professional track-like experience on a user-friendly scale.'
  },
  {
    id: '14',
    name: 'Royal Enfield Interceptor 650',
    type: 'Cruiser',
    pricePerDay: 2200,
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '648cc',
      topSpeed: '160 km/h'
    },
    description: 'The Interceptor 650 is a pure modern classic. Featuring a powerful parallel-twin engine, it delivers effortless power and a smooth ride that makes highway cruising a dream.'
  },
  {
    id: '15',
    name: 'TVS Ntorq 125 Race XP',
    type: 'Scooter',
    pricePerDay: 600,
    image: 'https://images.unsplash.com/photo-1595166415510-cb4a49683884?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '124cc',
      topSpeed: '98 km/h'
    },
    description: 'The TVS Ntorq 125 Race XP is India’s first 125cc scooter with riding modes. It is designed for youth who want performance, smart connectivity, and aggressive styling.'
  },
  {
    id: '16',
    name: 'Jawa 42 Bobber',
    type: 'Cruiser',
    pricePerDay: 1800,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '334cc',
      topSpeed: '130 km/h'
    },
    description: 'The Jawa 42 Bobber is a factory-custom motorcycle with a solo seat and stunning aesthetics. It’s for the rider who wants to stand out while enjoying a punchy, liquid-cooled ride.'
  },
  {
    id: '17',
    name: 'Hero XPulse 200 4V',
    type: 'Adventure',
    pricePerDay: 900,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '199cc',
      topSpeed: '115 km/h'
    },
    description: 'The Hero XPulse 200 4V is a versatile dual-purpose bike. It is exceptionally lightweight and capable, making it perfect for exploring forest trails and rural terrains on a budget.'
  },
  {
    id: '18',
    name: 'Suzuki V-Strom SX',
    type: 'Adventure',
    pricePerDay: 1700,
    image: 'https://images.unsplash.com/photo-1558981424-81878f0d5630?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '249cc',
      topSpeed: '135 km/h'
    },
    description: 'The Suzuki V-Strom SX is a versatile crossover adventure tourer. It combines the reliability of a commuter with the capabilities of a tourer, featuring a smooth oil-cooled engine.'
  },
  {
    id: '19',
    name: 'Bajaj Dominar 400',
    type: 'Cruiser',
    pricePerDay: 1400,
    image: 'https://images.unsplash.com/photo-1558980394-0c0f4569526d?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '373cc',
      topSpeed: '155 km/h'
    },
    description: 'The Bajaj Dominar 400 is a "Sports Tourer" designed to eat miles on the highway. With its high-torque engine and upright posture, it makes long trips comfortable and fast.'
  },
  {
    id: '20',
    name: 'Husqvarna Svartpilen 250',
    type: 'Sport',
    pricePerDay: 1300,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '248cc',
      topSpeed: '135 km/h'
    },
    description: 'The Husqvarna Svartpilen 250 is a Swedish-designed urban "Black Arrow". It features a unique rugged design, light frame, and a powerful engine that loves city exploration.'
  },
  {
    id: '21',
    name: 'KTM RC 390',
    type: 'Sport',
    pricePerDay: 2000,
    image: 'https://images.unsplash.com/photo-1621334969234-5231c828d173?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '373cc',
      topSpeed: '170 km/h'
    },
    description: 'The KTM RC 390 is a true race-bred machine. With fully adjustable suspension and cornering ABS, it offers a high-performance track bike feel for the everyday rider.'
  },
  {
    id: '22',
    name: 'Kawasaki Ninja 300',
    type: 'Sport',
    pricePerDay: 3000,
    image: 'https://images.unsplash.com/photo-1525160354160-c3d3957eb69c?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '296cc',
      topSpeed: '180 km/h'
    },
    description: 'The Ninja 300 is the most successful entry-level twin-cylinder sportbike. It offers smooth, accessible power and legendary Ninja styling for an unbeatable experience.'
  },
  {
    id: '23',
    name: 'TVS Ronin 225',
    type: 'Cruiser',
    pricePerDay: 1100,
    image: 'https://images.unsplash.com/photo-1558980394-0c0f4569526d?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '225cc',
      topSpeed: '120 km/h'
    },
    description: 'The TVS Ronin is a "Unscripted" modern-retro bike. It is designed to be versatile—handling city streets, rain, and light trails with equal ease and premium features.'
  },
  {
    id: '24',
    name: 'Royal Enfield Continental GT 650',
    type: 'Sport',
    pricePerDay: 2300,
    image: 'https://images.unsplash.com/photo-1558981424-81878f0d5630?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '648cc',
      topSpeed: '165 km/h'
    },
    description: 'The Continental GT 650 is a pure-bred Cafe Racer. It features clip-on handlebars and a rear-set footpeg position for an authentic, engaging retro-sport riding experience.'
  },
  {
    id: '25',
    name: 'Simple One',
    type: 'Electric',
    pricePerDay: 800,
    image: 'https://images.unsplash.com/photo-1595166415510-cb4a49683884?auto=format&fit=crop&q=80&w=800',
    transmission: 'Automatic',
    fuelType: 'Electric',
    locations: [...RENT_LOCATIONS],
    specs: {
      range: '212 km',
      topSpeed: '105 km/h'
    },
    description: 'The Simple One is a range-champion electric scooter. With a massive battery capacity and high performance, it offers a hassle-free, long-range electric ride for commuters.'
  },
  {
    id: '26',
    name: 'Benelli Imperiale 400',
    type: 'Cruiser',
    pricePerDay: 1600,
    image: 'https://images.unsplash.com/photo-1558981424-81878f0d5630?auto=format&fit=crop&q=80&w=800',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    locations: [...RENT_LOCATIONS],
    specs: {
      engine: '374cc',
      topSpeed: '120 km/h'
    },
    description: 'The Benelli Imperiale 400 is an authentic retro cruiser. It offers a smooth, vibrating-free ride with a classic look that harkens back to the golden era of motorcycling.'
  }
];

export const LOCATIONS = RENT_LOCATIONS;
