import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <div className="min-h-screen pt-[120px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Nos Catégories</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explorez notre vaste catalogue de pièces détachées classées par système.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            to={`/products?category=${cat.slug}`}
            className="group relative h-64 rounded-2xl overflow-hidden border border-white/10"
          >
            <img 
              src={cat.image_url} 
              alt={cat.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-dahak-red transition-colors">{cat.name}</h3>
              <span className="text-sm text-gray-300 group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2">
                Voir les produits &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
