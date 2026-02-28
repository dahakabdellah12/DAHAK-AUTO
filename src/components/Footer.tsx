import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = React.useState<any>({});

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <footer className="bg-dahak-gray border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              {settings.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  style={{ height: `${settings.logo_height || 40}px` }}
                  className="w-auto object-contain transition-all duration-300" 
                />
              ) : (
                <>
                  <div className="w-8 h-8 bg-dahak-red rounded flex items-center justify-center">
                    <span className="font-display font-bold text-white">D</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold tracking-wider leading-none">DAHAK</span>
                    <span className="text-xs text-dahak-red font-bold tracking-[0.2em] leading-none">AUTO</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Votre partenaire de confiance pour les pièces automobiles en Algérie. Qualité garantie et service professionnel.
            </p>
            <div className="flex gap-4">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-dahak-red transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-dahak-red transition-colors">
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Toutes les pièces</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Catégories</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">À Propos</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Populaire</h3>
            <ul className="space-y-3">
              <li><Link to="/products?category=engine-parts" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Moteur</Link></li>
              <li><Link to="/products?category=brake-system" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Freinage</Link></li>
              <li><Link to="/products?category=suspension" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Suspension</Link></li>
              <li><Link to="/products?category=accessories" className="text-gray-400 hover:text-dahak-red transition-colors text-sm">Accessoires</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Contact</h3>
            <ul className="space-y-4">
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-dahak-red shrink-0 mt-1" size={18} />
                  <span className="text-gray-400 text-sm">{settings.address}</span>
                </li>
              )}
              {settings.phone && settings.phone.replace(/\D/g, '').length === 12 && (
                <li className="flex items-center gap-3">
                  <Phone className="text-dahak-red shrink-0" size={18} />
                  <span className="text-gray-400 text-sm">{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <Mail className="text-dahak-red shrink-0" size={18} />
                  <span className="text-gray-400 text-sm">{settings.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} DAHAK AUTO. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <div className="text-gray-500 text-xs">
              <Link to="/privacy" className="hover:text-white">Politique de confidentialité</Link>
              <span className="mx-2">&</span>
              <Link to="/terms" className="hover:text-white">Conditions d'utilisation</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
