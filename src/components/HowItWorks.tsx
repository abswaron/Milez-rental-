import { motion } from 'motion/react';
import { Search, Calendar, CreditCard, Bike } from 'lucide-react';

const STEPS = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Find Your Ride',
    desc: 'Enter your pickup and drop-off details to see available bikes in your city.',
    color: 'bg-blue-500'
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Select Dates',
    desc: 'Choose your rental period. We offer flexible daily, weekly, and monthly plans.',
    color: 'bg-brand-orange'
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Book & Pay',
    desc: 'Confirm your details and choose to pay online or at the store during pickup.',
    color: 'bg-green-500'
  },
  {
    icon: <Bike className="w-8 h-8" />,
    title: 'Start Riding',
    desc: 'Pick up your keys from our nearest hub and hit the road with full freedom.',
    color: 'bg-purple-500'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest mb-4"
          >
            Simple Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 tracking-tight"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg font-medium"
          >
            Getting on the road with Milez is as easy as 1-2-3-4. Follow these simple steps to start your journey.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className={`w-20 h-20 ${step.color} rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-black/10 transition-transform group-hover:scale-110 group-hover:rotate-3 relative z-10`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white z-20">
                    {index + 1}
                  </div>
                  {/* Pulse Effect */}
                  <div className={`absolute inset-0 ${step.color} rounded-[24px] opacity-20 animate-ping group-hover:block hidden`} />
                </div>
                
                <h3 className="text-xl font-bold text-brand-dark mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
