import { Bike, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-brand-dark">MILEZ</span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">
              Premium bike rental service in Tamil Nadu. Experience the freedom of the open road with our well-maintained fleet.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-orange hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-orange hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-orange hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-brand-dark mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', id: 'hero' },
                { name: 'How It Works', id: 'how-it-works' },
                { name: 'Explore Vehicles', id: 'explore' },
                { name: 'Rental Locations', id: 'locations' },
                { name: 'Testimonials', id: 'testimonials' },
                { name: 'Contact Us', id: 'contact' }
              ].map(link => (
                <li key={link.name}>
                  <button 
                    onClick={() => scrollToSection(link.id)}
                    className="text-gray-500 hover:text-brand-orange font-medium transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-brand-dark mb-6">Locations</h4>
            <ul className="space-y-4">
              {['Chennai Hub', 'Coimbatore Central', 'Ooty Hill Station'].map(loc => (
                <li key={loc}>
                  <button 
                    onClick={() => scrollToSection('locations')}
                    className="text-gray-500 hover:text-brand-orange font-medium transition-colors"
                  >
                    {loc}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-brand-dark mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-orange shrink-0" />
                <a href="tel:08062181978" className="text-gray-500 font-medium hover:text-brand-orange">08062181978</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-orange shrink-0" />
                <a href="mailto:support@milez.in" className="text-gray-500 font-medium hover:text-brand-orange">support@milez.in</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange shrink-0" />
                <span className="text-gray-500 font-medium">Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-400 font-medium">
            © 2024 Milez Bike Rentals. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/legal" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">Terms</Link>
            <Link to="/legal" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">Privacy</Link>
            <Link to="/legal" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
