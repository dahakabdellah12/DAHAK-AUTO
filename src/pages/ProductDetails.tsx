import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Phone, ShoppingBag, Truck, Shield, AlertCircle } from 'lucide-react';
import { Product } from '../types';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [settings, setSettings] = useState<any>({});
  
  // Reservation Form State
  const [reservation, setReservation] = useState({
    customer_name: '',
    phone: '',
    city: '',
    quantity: 1,
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, [id]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product?.id,
          ...reservation
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setReservation({ customer_name: '', phone: '', city: '', quantity: 1, message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-[120px] text-center">Chargement...</div>;
  if (!product) return <div className="min-h-screen pt-[120px] text-center">Produit non trouvé</div>;

  const images = product.images && product.images.length > 0 ? product.images : ['https://placehold.co/600x400/1F1F1F/FFF?text=No+Image'];

  return (
    <div className="min-h-screen pt-[120px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <button 
        onClick={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/products');
          }
        }} 
        className="fixed top-[104px] left-4 md:left-8 p-3 bg-dahak-gray border border-white/10 text-gray-400 hover:text-white hover:border-dahak-red transition-all rounded-full cursor-pointer z-50"
        title="Retour"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain p-2"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors bg-black/40 ${activeImage === idx ? 'border-dahak-red' : 'border-transparent hover:border-white/20'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-6">
            <span className="text-dahak-red font-bold tracking-widest uppercase text-sm">{product.brand}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                product.stock_status === 'In Stock' ? 'bg-green-500/20 text-green-400' :
                product.stock_status === 'On Order' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {product.stock_status === 'In Stock' ? 'Disponible' : 
                 product.stock_status === 'On Order' ? 'Sur Commande' : 'Épuisé'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold uppercase tracking-wide">
                {product.condition === 'New' ? 'Neuf' : 'Occasion'}
              </span>
              {product.quantity !== undefined && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wide">
                  Stock: {product.quantity}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-display font-bold">{product.price.toLocaleString('fr-DZ')}</span>
            <span className="text-xl text-dahak-red font-bold">DZD</span>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-lg font-bold mb-2">Description</h3>
            <p className="text-gray-400">{product.description}</p>
            
            <h3 className="text-lg font-bold mt-6 mb-2">Compatibilité</h3>
            <p className="text-gray-400">{product.compatible_models}</p>
          </div>

          {/* Reservation Form */}
          <div className="bg-dahak-gray border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="text-dahak-red" /> Réserver cet article
            </h3>
            
            {success ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="text-white" size={24} />
                </div>
                <h4 className="text-green-400 font-bold text-lg mb-1">Demande envoyée !</h4>
                <p className="text-gray-300 text-sm">Nous vous contacterons bientôt pour confirmer votre commande.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-sm text-white underline hover:text-green-400"
                >
                  Nouvelle demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleReservation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom complet</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                      value={reservation.customer_name}
                      onChange={e => setReservation({...reservation, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                      value={reservation.phone}
                      onChange={e => setReservation({...reservation, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ville / Wilaya</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                      value={reservation.city}
                      onChange={e => setReservation({...reservation, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantité</label>
                    <input 
                      type="number" 
                      min="1"
                      max={product.quantity || 100}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                      value={reservation.quantity}
                      onChange={e => setReservation({...reservation, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message (Optionnel)</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-dahak-red focus:outline-none"
                    value={reservation.message}
                    onChange={e => setReservation({...reservation, message: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-dahak-red hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Envoi...' : 'Confirmer la réservation'}
                  </button>
                  {settings.whatsapp && settings.whatsapp.replace(/\D/g, '').length === 12 && (
                    <Link 
                      to="/whatsapp"
                      className="px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Phone size={20} />
                    </Link>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  <AlertCircle size={12} className="inline mr-1" />
                  Aucun paiement en ligne. Paiement à la livraison ou au magasin.
                </p>
              </form>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
              <Shield className="text-dahak-red" />
              <div>
                <h4 className="font-bold text-sm">Garantie</h4>
                <p className="text-xs text-gray-400">Produits vérifiés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
              <Truck className="text-dahak-red" />
              <div>
                <h4 className="font-bold text-sm">Livraison</h4>
                <p className="text-xs text-gray-400">58 Wilayas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
