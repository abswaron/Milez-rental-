import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Receipt, Download, Share2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useState } from 'react';

interface ReceiptModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ booking, isOpen, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  if (!booking) return null;

  const pricing = booking.pricing || {
    basePrice: booking.bike.pricePerDay,
    serviceFee: 99,
    discount: 0,
    total: booking.bike.pricePerDay + 99
  };

  const total = pricing.total;

  const handleSave = async () => {
    if (!receiptRef.current) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0'
        }
      });
      saveAs(dataUrl, `Milez-Receipt-${booking.bike.name.replace(/\s+/g, '-')}.png`);
    } catch (err) {
      console.error('Failed to save receipt:', err);
      setError('Failed to save receipt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Milez Rental Receipt',
      text: `Receipt for my ${booking.bike.name} rental at Milez. Total: ₹${total}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Receipt link copied to clipboard!');
        setTimeout(() => setShareMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div ref={receiptRef} className="bg-white">
              {/* Header */}
              <div className="bg-brand-dark p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="bg-brand-orange p-1.5 rounded-lg">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold tracking-tighter">MILEZ</span>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-white/80 uppercase tracking-widest">Payment Successful</span>
                  </div>
                  <h2 className="text-3xl font-bold">₹{total}</h2>
                  <p className="text-white/40 text-xs mt-1">
                    {booking.razorpayPaymentId ? `Payment ID: ${booking.razorpayPaymentId}` : `Booking ID: #${booking.id.slice(0, 8).toUpperCase()}`}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Bike Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                    <img 
                      src={booking.bike.image} 
                      alt={booking.bike.name} 
                      className="w-16 h-16 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                    <div>
                      <h3 className="font-bold text-brand-dark">{booking.bike.name}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">{booking.bike.type}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rental Fee ({pricing.days || 1} {pricing.days === 1 ? 'Day' : 'Days'})</span>
                      <span className="font-bold text-brand-dark">₹{pricing.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service & Insurance</span>
                      <span className="font-bold text-brand-dark">₹{pricing.serviceFee}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount Applied</span>
                        <span className="font-bold text-green-500">-₹{pricing.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taxes (GST)</span>
                      <span className="font-bold text-green-500">Included</span>
                    </div>
                    <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-brand-dark">Total Paid</span>
                      <span className="text-xl font-black text-brand-orange">₹{total}</span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <span>Date</span>
                      <span>{booking.timestamp instanceof Date ? booking.timestamp.toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <span>Method</span>
                      <span>{booking.paymentMethod === 'online' ? 'Razorpay / Online' : 'Pay at Store'}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-[10px] text-red-600 font-bold text-center">{error}</p>
                    </div>
                  )}

                  {shareMessage && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                      <p className="text-[10px] text-green-600 font-bold text-center">{shareMessage}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-12 flex flex-col gap-1 py-1 hover:bg-brand-orange/5 hover:text-brand-orange hover:border-brand-orange/30 transition-all"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span className="text-[8px] font-bold uppercase">{isSaving ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-12 flex flex-col gap-1 py-1 hover:bg-brand-orange/5 hover:text-brand-orange hover:border-brand-orange/30 transition-all"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-[8px] font-bold uppercase">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
