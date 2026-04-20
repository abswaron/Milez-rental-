import { useState, useEffect } from 'react';
import { Bike, MapPin, Menu, X, Phone, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Explore', href: 'explore' },
    { name: 'How It Works', href: 'how-it-works' },
    { name: 'My Bookings', href: 'my-bookings' },
    { name: 'Locations', href: 'locations' },
  ];

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || location.pathname !== '/' ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="bg-brand-orange p-1.5 rounded-lg">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-bold tracking-tighter ${isScrolled || location.pathname !== '/' ? 'text-brand-dark' : 'text-white'}`}>MILEZ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${isScrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-white/90'}`}
            >
              {link.name}
            </button>
          ))}
          
          {profile?.role === 'admin' ? (
            <Link 
              to="/admin"
              className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-brand-orange ${isScrolled || location.pathname !== '/' ? 'text-brand-orange' : 'text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          ) : profile && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[10px] opacity-20 hover:opacity-100 text-white"
              onClick={async () => {
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');
                await updateDoc(doc(db, 'users', profile.uid), { role: 'admin' });
                window.location.reload();
              }}
            >
              Enable Admin
            </Button>
          )}

          {profile ? (
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${isScrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-white/90'}`}
              onClick={async () => {
                const { auth } = await import('../lib/firebase');
                const { signOut } = await import('firebase/auth');
                await signOut(auth);
                window.location.reload();
              }}
            >
              Logout
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${isScrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-white/90'}`}
              onClick={() => scrollToSection('my-bookings')}
            >
              Login
            </Button>
          )}

          <Button 
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6"
            onClick={() => scrollToSection('explore')}
          >
            Book Now
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <a href="tel:08062181978" className={`p-2 rounded-full ${isScrolled || location.pathname !== '/' ? 'bg-gray-100 text-brand-dark' : 'bg-white/10 text-white'}`}>
            <Phone className="w-5 h-5" />
          </a>
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className={isScrolled || location.pathname !== '/' ? 'text-brand-dark' : 'text-white'}>
                <Menu className="w-6 h-6" />
              </Button>
            } />
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-2xl font-semibold hover:text-brand-orange transition-colors text-left"
                  >
                    {link.name}
                  </button>
                ))}
                
                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin"
                    className="flex items-center gap-3 text-2xl font-bold text-brand-orange"
                  >
                    <LayoutDashboard className="w-6 h-6" />
                    Admin Dashboard
                  </Link>
                )}

                {profile ? (
                  <button
                    onClick={async () => {
                      const { auth } = await import('../lib/firebase');
                      const { signOut } = await import('firebase/auth');
                      await signOut(auth);
                      window.location.reload();
                    }}
                    className="text-2xl font-semibold hover:text-brand-orange transition-colors text-left"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => scrollToSection('my-bookings')}
                    className="text-2xl font-semibold hover:text-brand-orange transition-colors text-left"
                  >
                    Login
                  </button>
                )}

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
