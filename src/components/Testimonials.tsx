import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Travel Vlogger',
    content: 'The best bike rental experience in Chennai. The Royal Enfield was in pristine condition and the booking process was seamless.',
    avatar: 'https://i.pravatar.cc/150?u=rahul'
  },
  {
    name: 'Priya Krishnan',
    role: 'Daily Commuter',
    content: 'I use Milez for my daily commute when my scooter is in service. Their electric bikes are amazing and very cost-effective.',
    avatar: 'https://i.pravatar.cc/150?u=priya'
  },
  {
    name: 'David Miller',
    role: 'Tourist',
    content: 'Renting a bike in Ooty from Milez was the highlight of my trip. Exploring the hills on two wheels is the only way to do it!',
    avatar: 'https://i.pravatar.cc/150?u=david'
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4 tracking-tight">What Our Riders Say</h2>
          <p className="text-gray-500 font-medium">Join thousands of satisfied customers who trust Milez for their journeys.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 relative"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-50 opacity-10" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-8 leading-relaxed italic">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-brand-dark">{t.name}</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
