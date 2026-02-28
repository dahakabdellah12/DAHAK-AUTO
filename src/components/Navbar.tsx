import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Search, ShoppingBag, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [lang, setLang] = useState('fr');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));

    const savedLang = localStorage.getItem('app-language');
    if (savedLang) setLang(savedLang);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr';
    setLang(newLang);
    localStorage.setItem('app-language', newLang);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Pièces', path: '/products' },
    { name: 'Catégories', path: '/categories' },
    { name: 'À Propos', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dahak-dark/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {settings.site_logo ? (
              <img 
                src={settings.site_logo} 
                alt="Logo" 
                style={{ height: `${settings.logo_height || 40}px` }}
                className="w-auto object-contain transition-all duration-300" 
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-dahak-red rounded-lg flex items-center justify-center transform group-hover:skew-x-[-10deg] transition-transform">
                  <span className="font-display font-bold text-white text-xl">D</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-xl tracking-wider leading-none">DAHAK</span>
                  <span className="text-xs text-dahak-red font-bold tracking-[0.2em] leading-none">AUTO</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-dahak-red ${
                  location.pathname === link.path ? 'text-dahak-red' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 text-gray-300 hover:text-white transition-colors font-bold text-sm flex items-center gap-1"
              title={lang === 'fr' ? 'Switch to Arabic' : 'Passer en Français'}
            >
              <Globe size={18} />
              <span>{lang === 'fr' ? 'AR' : 'FR'}</span>
            </button>
            <Link to="/products" className="p-2 text-gray-300 hover:text-white transition-colors">
              <Search size={20} />
            </Link>
            <Link to="/admin" className="p-2 text-gray-300 hover:text-white transition-colors">
              <User size={20} />
            </Link>
            {settings.phone && settings.phone.replace(/\D/g, '').length === 12 && (
              <Link
                to="/whatsapp"
                className="bg-dahak-red hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Phone size={16} />
                <span>{settings.phone}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dahak-dark border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block text-base font-medium ${
                    location.pathname === link.path ? 'text-dahak-red' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Globe size={18} /> {lang === 'fr' ? 'Arabe' : 'Français'}
                </button>
                <Link to="/admin" className="flex items-center gap-2 text-gray-300">
                  <User size={18} /> Espace Admin
                </Link>
                {settings.phone && (
                  <Link
                    to="/whatsapp"
                    className="bg-dahak-red text-white py-3 rounded-lg text-center font-bold"
                  >
                    Appeler Maintenant
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
