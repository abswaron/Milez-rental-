import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Bike } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Plus, Trash2, Edit2, Save, X, Package, Settings, Users, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Bike>>({
    name: '',
    type: 'Scooter',
    pricePerDay: 0,
    image: '',
    status: 'available',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    locations: ['Ekkatuthangal,Tamil Nadu'],
    description: '',
    specs: {
      engine: '',
      range: '',
      topSpeed: ''
    }
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bikes'), (snapshot) => {
      const bikeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
      setBikes(bikeData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'bikes', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'bikes'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setIsAdding(false);
      }
      setFormData({
        name: '',
        type: 'Scooter',
        pricePerDay: 0,
        image: '',
        status: 'available',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        locations: ['Ekkatuthangal,Tamil Nadu'],
        description: '',
        specs: {
          engine: '',
          range: '',
          topSpeed: ''
        }
      });
    } catch (error) {
      console.error('Error saving bike:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        await deleteDoc(doc(db, 'bikes', id));
      } catch (error) {
        console.error('Error deleting bike:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Fleet Management</h1>
            <p className="text-gray-500 font-medium">Manage your rental inventory and vehicle status.</p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg shadow-brand-orange/20"
          >
            <Plus className="w-5 h-5" />
            Add New Vehicle
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 rounded-3xl border-none shadow-sm bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-brand-dark">Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Total Fleet</span>
                  <span className="font-bold text-brand-dark">{bikes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Available</span>
                  <span className="font-bold text-green-600">{bikes.filter(b => b.status === 'available').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Maintenance</span>
                  <span className="font-bold text-orange-500">{bikes.filter(b => b.status === 'maintenance').length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence>
              {(isAdding || editingId) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-8 rounded-[32px] border-none shadow-xl bg-white">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold text-brand-dark">
                        {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
                      </h2>
                      <button 
                        onClick={() => { setIsAdding(false); setEditingId(null); }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle Name</label>
                        <Input 
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Royal Enfield Classic 350"
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</label>
                        <select 
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                          className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                        >
                          <option value="Scooter">Scooter</option>
                          <option value="Cruiser">Cruiser</option>
                          <option value="Sport">Sport</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price Per Day (₹)</label>
                        <Input 
                          type="number"
                          value={formData.pricePerDay}
                          onChange={e => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                        <select 
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                        >
                          <option value="available">Available</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image URL</label>
                        <Input 
                          value={formData.image}
                          onChange={e => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Engine (cc)</label>
                        <Input 
                          value={formData.specs?.engine || ''}
                          onChange={e => setFormData({ ...formData, specs: { ...formData.specs, engine: e.target.value } })}
                          placeholder="e.g. 350cc"
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Range (km)</label>
                        <Input 
                          value={formData.specs?.range || ''}
                          onChange={e => setFormData({ ...formData, specs: { ...formData.specs, range: e.target.value } })}
                          placeholder="e.g. 150km"
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Speed (km/h)</label>
                        <Input 
                          value={formData.specs?.topSpeed || ''}
                          onChange={e => setFormData({ ...formData, specs: { ...formData.specs, topSpeed: e.target.value } })}
                          placeholder="e.g. 120km/h"
                          className="rounded-xl h-12 bg-gray-50 border-none focus-visible:ring-brand-orange"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                      <Button 
                        variant="ghost" 
                        onClick={() => { setIsAdding(false); setEditingId(null); }}
                        className="rounded-xl h-12 px-8 font-bold text-gray-500"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-brand-orange/20"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Vehicle
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-6">
              {bikes.map(bike => (
                <Card key={bike.id} className="p-6 rounded-3xl border-none shadow-sm bg-white group overflow-hidden">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={bike.image} 
                        alt={bike.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-brand-dark truncate">{bike.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          bike.status === 'available' ? 'bg-green-50 text-green-600' : 
                          bike.status === 'maintenance' ? 'bg-orange-50 text-orange-600' : 
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {bike.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-4">{bike.type} • ₹{bike.pricePerDay}/day</p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(bike.id);
                            setFormData({
                              ...bike,
                              specs: bike.specs || { engine: '', range: '', topSpeed: '' }
                            });
                            setIsAdding(false);
                          }}
                          className="p-2 hover:bg-brand-orange/10 rounded-lg text-gray-400 hover:text-brand-orange transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bike.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
