import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  fromCatalog?: boolean;
  searchParams?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, fromCatalog = false, searchParams = '' }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x400/1F1F1F/FFF?text=No+Image';

  return (
    <div className="group bg-dahak-gray rounded-xl overflow-hidden border border-white/5 hover:border-dahak-red/50 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            product.stock_status === 'In Stock' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            product.stock_status === 'On Order' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {product.stock_status === 'In Stock' ? 'Disponible' : 
             product.stock_status === 'On Order' ? 'Sur Commande' : 'Épuisé'}
          </span>
        </div>
        {product.condition === 'Used' && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/10 text-white border border-white/20 backdrop-blur-sm">
              Occasion
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs text-dahak-red font-semibold uppercase tracking-wider">{product.brand}</span>
        </div>
        <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 group-hover:text-dahak-red transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Prix</p>
            <p className="font-display font-bold text-xl text-white">
              {product.price.toLocaleString('fr-DZ')} <span className="text-sm text-dahak-red">DZD</span>
            </p>
          </div>
          <Link 
            to={`/products/${product.id}`}
            state={{ fromCatalog, searchParams }}
            className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-dahak-red transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
