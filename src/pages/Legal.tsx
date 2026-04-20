import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Scale, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-brand-dark mb-4">Legal & Compliance</h1>
            <p className="text-gray-500">Everything you need to know about our terms and policies.</p>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-orange" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark">Terms of Service</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p>Welcome to Milez. By using our services, you agree to comply with and be bound by the following terms and conditions of use.</p>
                <h4 className="text-brand-dark font-bold mt-4">1. Rental Agreement</h4>
                <p>All rentals are subject to vehicle availability and verification of user documents. The user must possess a valid driving license for the category of vehicle rented.</p>
                <h4 className="text-brand-dark font-bold mt-4">2. User Responsibilities</h4>
                <p>The user is responsible for any damage to the vehicle during the rental period. Traffic violations and fines incurred during the rental period are the sole responsibility of the user.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-brand-orange" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark">Privacy Policy</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p>We value your privacy. This policy outlines how we collect, use, and protect your personal information.</p>
                <h4 className="text-brand-dark font-bold mt-4">Data Collection</h4>
                <p>We collect information such as your name, contact details, and driving license for the purpose of providing rental services and ensuring safety.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-brand-orange" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark">Refund & Cancellation</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p>Our cancellation policy is designed to be fair to both users and our fleet partners.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Full Refund:</strong> Cancellations made more than 24 hours before the pickup time.</li>
                  <li><strong>Partial Refund (50%):</strong> Cancellations made between 6 and 24 hours before pickup.</li>
                  <li><strong>No Refund:</strong> Cancellations made less than 6 hours before pickup or no-shows.</li>
                </ul>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
