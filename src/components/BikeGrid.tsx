import { useState } from 'react';
import { BIKES, LOCATIONS } from '../data/bikes';
import BikeCard from './BikeCard';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';

import { Bike } from '../types';

interface BikeGridProps {
  onBook: (bike: Bike) => void;
}

export default function BikeGrid({ onBook }: BikeGridProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [activeLocation, setActiveLocation] = useState('All');

  const categories = ['All', 'Scooter', 'Sport', 'Cruiser', 'Electric'];

  const filteredBikes = BIKES.filter(bike => {
    const categoryMatch = activeTab === 'All' || bike.type === activeTab;
    const locationMatch = activeLocation === 'All' || bike.locations.includes(activeLocation);
    return categoryMatch && locationMatch;
  });

  return (
    <section id="explore" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 tracking-tight">Our Premium Fleet</h2>
            <p className="text-gray-500 max-w-md font-medium">
              Choose from our wide range of well-maintained vehicles. From city scooters to powerful cruisers.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Category:</span>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <TabsList className="bg-transparent h-auto p-0">
                  {categories.map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-brand-orange data-[state=active]:text-white"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Location:</span>
              <div className="flex gap-2">
                {['All', ...LOCATIONS].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setActiveLocation(loc)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeLocation === loc 
                        ? 'bg-brand-dark text-white border-brand-dark' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBikes.map((bike, index) => (
              <motion.div
                key={bike.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <BikeCard bike={bike} onBook={onBook} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">No bikes found in this category for the selected location.</p>
          </div>
        )}
      </div>
    </section>
  );
}
