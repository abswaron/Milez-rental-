import { useState, useEffect } from 'react';
import { Bike, MapPin, Menu, X, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Explore', href: '#explore' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Locations', href: '#locations' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="bg-brand-orange p-1.5 rounded-lg">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-bold tracking-tighter ${isScrolled ? 'text-brand-dark' : 'text-white'}`}>MILEZ</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href.substring(1));
              }}
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}
            >
              {link.name}
            </a>
          ))}
          <Button 
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6"
            onClick={() => scrollToSection('explore')}
          >
            Book Now
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <a href="tel:08062181978" className={`p-2 rounded-full ${isScrolled ? 'bg-gray-100 text-brand-dark' : 'bg-white/10 text-white'}`}>
            <Phone className="w-5 h-5" />
          </a>
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className={isScrolled ? 'text-brand-dark' : 'text-white'}>
                <Menu className="w-6 h-6" />
              </Button>
            } />
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href.substring(1));
                    }}
                    className="text-2xl font-semibold hover:text-brand-orange transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <Button 
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white w-full py-6 text-lg"
                  onClick={() => scrollToSection('explore')}
                >
                  Book Your Ride
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
