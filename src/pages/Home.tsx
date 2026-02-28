import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, Settings, Shield, Truck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    // Fetch popular products (most reserved/requested)
    fetch('/api/products?sort=popular&limit=8')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 6)));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {settings.home_hero_image && (
            <img 
              src={settings.home_hero_image}
              alt="Luxury Car Garage" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[2px] w-12 bg-dahak-red" />
              <span className="text-dahak-red font-bold tracking-widest uppercase text-sm">Expert en Pièces Auto</span>
            </div>
            {settings.home_hero_title ? (
               <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 whitespace-pre-line">
                 {settings.home_hero_title}
               </h1>
            ) : (
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                PIÈCES AUTO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ORIGINALES</span>
              </h1>
            )}
            <p className="text-gray-400 text-lg mb-8 max-w-lg whitespace-pre-line">
              {settings.home_hero_subtitle || "Trouvez les meilleures pièces de rechange pour votre véhicule. Qualité garantie, prix compétitifs et service professionnel en Algérie."}
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex items-center gap-2 max-w-md mb-8">
              <Search className="text-gray-400 ml-3" />
              <input 
                type="text" 
                placeholder="Rechercher une pièce" 
                className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/products?search=${searchQuery}`)}
              />
              <Link 
                to={`/products?search=${searchQuery}`}
                className="bg-dahak-red hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Chercher
              </Link>
            </div>

            <div className="flex gap-4">
              <Link to="/products" className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Voir le Catalogue
              </Link>
              <Link to="/contact" className="px-8 py-3 border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                Nous Contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-dahak-dark">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Nos Catégories</h2>
              <p className="text-gray-400">Explorez notre large gamme de pièces détachées</p>
            </div>
            <Link to="/categories" className="hidden md:flex items-center gap-2 text-dahak-red hover:text-white transition-colors font-medium">
              Tout voir <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.slug}`}
                className="group relative h-40 rounded-xl overflow-hidden border border-white/10"
              >
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                  <span className="font-medium text-white group-hover:text-dahak-red transition-colors">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/categories" className="inline-flex items-center gap-2 text-dahak-red font-medium">
              Voir toutes les catégories <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-20 bg-dahak-gray border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-dahak-red font-bold tracking-widest uppercase text-sm">Les plus demandés</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">Produits</h2>
            <div className="h-1 w-20 bg-dahak-red mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xl text-gray-300 mb-4">No spare parts available yet.</p>
                {settings.whatsapp && (
                  <Link 
                    to="/whatsapp"
                    className="inline-flex items-center gap-2 text-dahak-red font-bold hover:underline"
                  >
                    Contact us via WhatsApp
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/products" 
              className="inline-block px-8 py-3 border border-dahak-red text-dahak-red font-bold rounded-lg hover:bg-dahak-red hover:text-white transition-all"
            >
              Voir tout le stock
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-dahak-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-dahak-red/5 skew-x-[-20deg]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Pourquoi Choisir <span className="text-dahak-red">DAHAK AUTO</span> ?</h2>
              <p className="text-gray-400 text-lg mb-8">
                Nous nous engageons à fournir des pièces automobiles de la plus haute qualité avec un service client exceptionnel.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Pièces Originales</h3>
                    <p className="text-gray-400 text-sm">Garantie d'authenticité sur toutes nos pièces neuves.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Expertise Technique</h3>
                    <p className="text-gray-400 text-sm">Conseils professionnels pour choisir la bonne pièce.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Disponibilité Rapide</h3>
                    <p className="text-gray-400 text-sm">Stock important et commande rapide si nécessaire.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 border-2 border-dahak-red/20 rounded-2xl transform rotate-3" />
              {settings.home_feature_image && (
                <img 
                  src={settings.home_feature_image}
                  alt="Mechanic working" 
                  className="rounded-xl shadow-2xl relative z-10 w-full"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-dahak-red">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Besoin d'une pièce spécifique ?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Si vous ne trouvez pas ce que vous cherchez, contactez-nous directement. Nous pouvons commander la pièce pour vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3 bg-white text-dahak-red font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Contactez-nous
            </Link>
            {settings.whatsapp && (
              <Link to="/whatsapp" className="px-8 py-3 bg-black/20 text-white font-bold rounded-lg hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                WhatsApp
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
