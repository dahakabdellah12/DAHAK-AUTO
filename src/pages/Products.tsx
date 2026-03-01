import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
      
    // Fetch brands
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBrands(data);
        } else {
          console.error('Failed to fetch brands:', data);
          setBrands([]);
        }
      })
      .catch(err => {
        console.error('Error fetching brands:', err);
        setBrands([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    // Build query string
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);
    if (selectedBrand) params.append('brand', selectedBrand);
    
    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery, selectedBrand]);

  // Update URL when filters change
  useEffect(() => {
    const currentCategory = searchParams.get('category') || '';
    const currentSearch = searchParams.get('search') || '';
    
    // Only update if values actually changed to avoid redundant history entries
    if (selectedCategory !== currentCategory || searchQuery !== currentSearch) {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, searchQuery, searchParams, setSearchParams]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedBrand('');
    setPriceRange([0, 200000]);
  };

  return (
    <div className="min-h-screen pt-[104px] pb-12">
      {/* Sticky Search Bar */}
      <div className="sticky top-[64px] z-40 bg-dahak-dark/95 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex items-center gap-2 w-full">
            <Search className="text-gray-400 ml-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Rechercher une pièce" 
              className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="bg-dahak-red hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shrink-0"
            >
              Chercher
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Nos Pièces</h1>
            <p className="text-gray-400">Trouvez la pièce exacte pour votre véhicule</p>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm font-medium"
          >
            <Filter size={18} /> Filtres
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-dahak-gray border border-white/5 rounded-xl p-6 sticky top-40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filtres</h3>
                {(selectedCategory || searchQuery || selectedBrand) && (
                  <button onClick={clearFilters} className="text-xs text-dahak-red hover:underline">
                    Effacer
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Catégorie</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    className="accent-dahak-red"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                  />
                  <span className={`text-sm ${selectedCategory === '' ? 'text-white' : 'text-gray-400'}`}>Toutes</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      className="accent-dahak-red"
                      checked={selectedCategory === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                    />
                    <span className={`text-sm ${selectedCategory === cat.slug ? 'text-white' : 'text-gray-400'}`}>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Brands */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Marque</label>
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Toutes les marques</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  fromCatalog={true} 
                  searchParams={searchParams.toString()} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
              <Search className="mx-auto text-gray-600 mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-400 mb-6">
                {products.length === 0 && !searchQuery && !selectedCategory && !selectedBrand 
                  ? "No spare parts available yet." 
                  : "Essayez de modifier vos filtres de recherche."}
              </p>
              
              {products.length === 0 && !searchQuery && !selectedCategory && !selectedBrand ? (
                <Link 
                  to="/whatsapp"
                  className="inline-block px-6 py-2 bg-dahak-red text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                >
                  Contact us via WhatsApp
                </Link>
              ) : (
                <button 
                  onClick={clearFilters}
                  className="text-dahak-red font-medium hover:underline"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
