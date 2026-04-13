import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const locations = [
  {
    name: 'Chennai',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
    description: 'Explore the vibrant capital city, from Marina Beach to historic temples.'
  },
  {
    name: 'Coimbatore',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=800',
    description: 'The Manchester of South India. Perfect gateway to the Western Ghats.'
  },
  {
    name: 'Ooty',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    description: 'Ride through the misty tea gardens and winding mountain roads.'
  }
];

export default function LocationSection() {
  const scrollToExplore = () => {
    const element = document.getElementById('explore');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="locations" className="py-24 bg-brand-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Available Across <span className="text-brand-orange">Tamil Nadu</span></h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Whether you're looking for a daily commute in the city or a weekend getaway to the hills, we've got you covered in the major hubs.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-orange">3</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cities</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-orange">50+</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Bikes</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-orange">10k+</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Happy Riders</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {locations.map((loc, index) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              onClick={scrollToExplore}
              className="group relative h-[500px] rounded-[40px] overflow-hidden cursor-pointer"
            >
              <img
                src={loc.image}
                alt={loc.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 text-brand-orange mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">{loc.name}</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{loc.name}</h3>
                <p className="text-white/60 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {loc.description}
                </p>
                <div className="flex items-center gap-2 text-white font-bold group-hover:text-brand-orange transition-colors">
                  Explore Bikes <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
