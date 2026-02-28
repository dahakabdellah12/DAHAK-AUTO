import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Box, MessageSquare, ShoppingBag, LogOut, Plus, Trash, Edit, Check, X, Layers, Settings as SettingsIcon, Minus, Copy, Home } from 'lucide-react';
import { Product, Reservation, Message, Category, Settings } from '../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'reservations' | 'messages' | 'settings'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Partial<Settings>>({});
  
  // Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [showProductModal, setShowProductModal] = useState(false);

  // Category Form State
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'product' | 'category' | 'reservation' | null;
    id: number | null;
  }>({
    isOpen: false,
    type: null,
    id: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/admin');
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      let res;
      if (activeTab === 'dashboard') {
        res = await fetch('/api/stats', { headers });
      } else if (activeTab === 'products') {
        res = await fetch('/api/products', { headers });
        if (res.ok) {
          setProducts(await res.json());
          const catRes = await fetch('/api/categories');
          if (catRes.ok) setCategories(await catRes.json());
        }
      } else if (activeTab === 'categories') {
        res = await fetch('/api/categories', { headers });
        if (res.ok) setCategories(await res.json());
      } else if (activeTab === 'reservations') {
        res = await fetch('/api/reservations', { headers });
        if (res.ok) setReservations(await res.json());
      } else if (activeTab === 'messages') {
        res = await fetch('/api/messages', { headers });
        if (res.ok) setMessages(await res.json());
      } else if (activeTab === 'settings') {
        res = await fetch('/api/settings', { headers });
        if (res.ok) setSettings(await res.json());
      }

      if (res && (res.status === 401 || res.status === 403)) {
        handleLogout();
        return;
      }
      
      if (activeTab === 'dashboard' && res && res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  const openDeleteModal = (type: 'product' | 'category' | 'reservation' | 'message', id: number) => {
    setDeleteConfirmation({ isOpen: true, type, id });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({ isOpen: false, type: null, id: null });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirmation;
    if (!type || !id) return;

    const endpoint = type === 'product' ? 'products' : type === 'category' ? 'categories' : type === 'reservation' ? 'reservations' : 'messages';
    
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
      
      fetchData();
      closeDeleteModal();
    } catch (err: any) {
      alert(`Impossible de supprimer: ${err.message}`);
      console.error(err);
      closeDeleteModal();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/products/${currentProduct.id}` : '/api/products';
    
    const productData = {
      ...currentProduct,
      images: (Array.isArray(currentProduct.images) ? currentProduct.images : [currentProduct.images])
        .filter(img => img && typeof img === 'string' && img.trim() !== ''),
      condition: currentProduct.condition || 'New',
      stock_status: currentProduct.stock_status || 'In Stock',
      category_id: currentProduct.category_id || (categories.length > 0 ? categories[0].id : 1),
      is_featured: currentProduct.is_featured || false,
      quantity: currentProduct.quantity || 1
    };

    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(productData)
    });
    
    setShowProductModal(false);
    fetchData();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = currentCategory.name?.toLowerCase().replace(/ /g, '-') || '';
    
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ ...currentCategory, slug })
    });
    
    setShowCategoryModal(false);
    fetchData();
  };

  // Auto-save settings
  useEffect(() => {
    if (activeTab !== 'settings' || Object.keys(settings).length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ settings })
        });

        if (res.status === 401 || res.status === 403) {
          handleLogout();
        }
      } catch (err) {
        console.error('Auto-save failed', err);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [settings, activeTab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    // Manual save is now redundant but kept for immediate feedback if needed
    // The auto-save effect handles the actual saving
    alert('Paramètres enregistrés !');
  };

  const updateReservationStatus = async (id: number, status: string) => {
    await fetch(`/api/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const formatPhoneNumber = (value: string) => {
    // Strip all non-digits
    let digits = value.replace(/\D/g, '');
    
    // If empty, return empty
    if (!digits) return '';

    // If user pastes full number with 213, strip it
    if (digits.startsWith('213')) digits = digits.substring(3);

    // If user types 0 at start, strip it (we want 555...)
    if (digits.startsWith('0')) digits = digits.substring(1);

    // Limit to 9 digits (555 XX XX XX)
    digits = digits.substring(0, 9);

    // Format: 555 XX XX XX
    let formatted = '';
    
    if (digits.length > 0) formatted += digits.substring(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);

    return formatted;
  };

  // Helper to get display value (without prefix)
  const getPhoneDisplayValue = (fullNumber: string) => {
    if (!fullNumber) return '';
    // Remove +213 or 213 prefix
    let clean = fullNumber.replace(/^\+?213\s?/, '');
    // If it starts with 0, remove it too (just in case)
    if (clean.startsWith('0')) clean = clean.substring(1);
    
    // Re-format just to be safe
    return formatPhoneNumber(clean);
  };

  // Auto-save settings with validation
  useEffect(() => {
    if (activeTab !== 'settings' || Object.keys(settings).length === 0) return;

    // Validate phone numbers before saving
    // Must be exactly 12 digits (213 + 9 digits)
    const phoneDigits = settings.phone ? settings.phone.replace(/\D/g, '') : '';
    const whatsappDigits = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '';

    const phoneValid = !settings.phone || (phoneDigits.length === 12 && phoneDigits.startsWith('213'));
    const whatsappValid = !settings.whatsapp || (whatsappDigits.length === 12 && whatsappDigits.startsWith('213'));

    // if (!phoneValid || !whatsappValid) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ settings })
        });

        if (res.status === 401 || res.status === 403) {
          handleLogout();
        }
      } catch (err) {
        console.error('Auto-save failed', err);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [settings, activeTab]);

  return (
    <div className="min-h-screen bg-dahak-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dahak-gray border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/5">
          <span className="font-display font-bold text-xl">DAHAK <span className="text-dahak-red">ADMIN</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <BarChart3 size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Box size={20} /> Produits
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Layers size={20} /> Catégories
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reservations' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <ShoppingBag size={20} /> Réservations
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <MessageSquare size={20} /> Messages
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-dahak-red text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <SettingsIcon size={20} /> Paramètres
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative">
        <Link 
          to="/" 
          className="absolute top-7 right-8 p-3 bg-dahak-gray border border-white/10 text-gray-400 hover:text-white hover:border-dahak-red transition-all rounded-full z-10"
          title="Retour au site"
        >
          <Home size={24} />
        </Link>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <h2 className="text-3xl font-display font-bold">Vue d'ensemble</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dahak-gray border border-white/10 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Box /></div>
                  <span className="text-xs text-gray-500 uppercase font-bold">Total Produits</span>
                </div>
                <span className="text-4xl font-bold">{stats.products}</span>
              </div>
              <div className="bg-dahak-gray border border-white/10 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><ShoppingBag /></div>
                  <span className="text-xs text-gray-500 uppercase font-bold">Réservations</span>
                </div>
                <span className="text-4xl font-bold">{stats.reservations}</span>
              </div>
              <div className="bg-dahak-gray border border-white/10 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><MessageSquare /></div>
                  <span className="text-xs text-gray-500 uppercase font-bold">Messages</span>
                </div>
                <span className="text-4xl font-bold">{stats.messages}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8 pr-16">
              <h2 className="text-3xl font-display font-bold">Gestion Produits</h2>
              <button 
                onClick={() => {
                  setCurrentProduct({ quantity: 1 });
                  setIsEditing(false);
                  setShowProductModal(true);
                }}
                className="bg-dahak-red hover:bg-red-600 active:scale-95 transition-transform text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> Ajouter Produit
              </button>
            </div>

            <div className="bg-dahak-gray border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Quantité</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-white/5">
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">{product.price} DZD</td>
                      <td className="p-4">{product.quantity || 1}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.stock_status === 'In Stock' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.stock_status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button 
                          onClick={() => {
                            setCurrentProduct(product);
                            setIsEditing(true);
                            setShowProductModal(true);
                          }}
                          className="p-2 hover:bg-white/10 active:scale-95 transition-transform rounded text-blue-400"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal('product', product.id)}
                          className="p-2 hover:bg-white/10 active:scale-95 transition-transform rounded text-red-400"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-8 pr-16">
              <h2 className="text-3xl font-display font-bold">Gestion Catégories</h2>
              <button 
                onClick={() => {
                  setCurrentCategory({});
                  setShowCategoryModal(true);
                }}
                className="bg-dahak-red hover:bg-red-600 active:scale-95 transition-transform text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> Ajouter Catégorie
              </button>
            </div>

            <div className="bg-dahak-gray border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <img src={cat.image_url} alt={cat.name} className="w-12 h-12 rounded object-cover" />
                      </td>
                      <td className="p-4 font-medium">{cat.name}</td>
                      <td className="p-4 text-gray-400">{cat.slug}</td>
                      <td className="p-4 flex gap-2">
                        <button 
                          onClick={() => openDeleteModal('category', cat.id)}
                          className="p-2 hover:bg-white/10 active:scale-95 transition-transform rounded text-red-400"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">Réservations</h2>
            <div className="grid gap-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-dahak-gray border border-white/10 p-6 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{res.customer_name}</h4>
                      <span className="text-gray-500 text-sm">• {res.phone}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Produit: <span className="text-white">{res.product_name}</span> (Qté: {res.quantity})</p>
                    <p className="text-gray-500 text-xs">{res.city} • {new Date(res.created_at).toLocaleString()}</p>
                    {res.message && <p className="mt-2 text-sm italic text-gray-400">"{res.message}"</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {res.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateReservationStatus(res.id, 'confirmed')}
                          className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 active:scale-95 transition-transform rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                          <Check size={16} /> Confirmer
                        </button>
                        <button 
                          onClick={() => updateReservationStatus(res.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95 transition-transform rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                          <X size={16} /> Annuler
                        </button>
                      </>
                    )}
                    {res.status !== 'pending' && (
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold text-center ${
                        res.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {res.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                      </span>
                    )}
                    <button 
                      onClick={() => openDeleteModal('reservation', res.id)}
                      className="px-4 py-2 bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-transform rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Trash size={16} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">Messages</h2>
            <div className="space-y-6">
              {Object.entries(
                messages.reduce((acc: any, msg) => {
                  // Group by email or phone or name
                  const key = msg.email || msg.phone || `user-${msg.name}`;
                  if (!acc[key]) {
                    acc[key] = {
                      id: key,
                      name: msg.name,
                      email: msg.email,
                      phone: msg.phone,
                      msgs: []
                    };
                  }
                  acc[key].msgs.push(msg);
                  return acc;
                }, {})
              )
              .sort(([, a]: any, [, b]: any) => {
                // Sort by most recent message in the group
                const dateA = new Date(a.msgs[0].created_at).getTime();
                const dateB = new Date(b.msgs[0].created_at).getTime();
                return dateB - dateA;
              })
              .map(([key, group]: any) => (
                <div key={key} className="bg-dahak-gray border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{group.name}</h4>
                      <div className="flex gap-4 text-sm text-gray-400">
                        {group.email && <span>{group.email}</span>}
                        {group.phone && <span>{group.phone}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                      {group.msgs.length} message{group.msgs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {group.msgs.map((msg: Message) => (
                      <div key={msg.id} className="p-4 relative group hover:bg-white/5 transition-colors">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                          <button 
                            onClick={() => openDeleteModal('message', msg.id)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer ce message"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                        <p className="text-gray-300">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-dahak-gray border border-white/10 rounded-xl">
                  Aucun message reçu pour le moment.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">Paramètres</h2>
            <form onSubmit={handleSaveSettings} className="bg-dahak-gray border border-white/10 rounded-xl p-8 max-w-2xl">
              <h3 className="text-xl font-bold mb-6">Informations de Contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo du Site</label>
                  <div className="flex gap-4 items-center">
                    {settings.site_logo && (
                      <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center border border-white/10 p-2">
                        <img src={settings.site_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 flex gap-2">
                      <input 
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        placeholder="URL du logo..."
                        value={settings.site_logo || ''}
                        onChange={e => setSettings({...settings, site_logo: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(settings.site_logo || '')}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                        title="Copier le lien"
                      >
                        <Copy size={16} />
                      </button>
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-xs font-bold">Upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const formData = new FormData();
                              formData.append('image', e.target.files[0]);
                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                  body: formData
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setSettings({...settings, site_logo: data.url});
                                }
                              } catch (err) {
                                console.error('Upload failed', err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taille du Logo (px)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="20"
                      max="100"
                      className="flex-1 accent-dahak-red"
                      value={settings.logo_height || 40}
                      onChange={e => setSettings({...settings, logo_height: e.target.value})}
                    />
                    <span className="text-white font-mono w-12 text-center">{settings.logo_height || 40}px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone</label>
                  <div className="flex items-center bg-black/20 border border-white/10 rounded-lg focus-within:border-dahak-red transition-colors">
                    <span className="pl-3 pr-2 text-gray-400 font-mono select-none border-r border-white/10">+213</span>
                    <input 
                      className="w-full bg-transparent p-3 focus:outline-none font-mono text-white"
                      value={getPhoneDisplayValue(settings.phone || '')}
                      onChange={e => {
                        const local = formatPhoneNumber(e.target.value);
                        // Store as full international format: +213 555 12 34 56
                        setSettings({...settings, phone: local ? `+213 ${local}` : ''});
                      }}
                      placeholder="555 12 34 56"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                  <div className="flex items-center bg-black/20 border border-white/10 rounded-lg focus-within:border-dahak-red transition-colors">
                    <span className="pl-3 pr-2 text-gray-400 font-mono select-none border-r border-white/10">+213</span>
                    <input 
                      className="w-full bg-transparent p-3 focus:outline-none font-mono text-white"
                      value={getPhoneDisplayValue(settings.whatsapp || '')}
                      onChange={e => {
                        const local = formatPhoneNumber(e.target.value);
                        // Store as full international format: +213 555 12 34 56
                        setSettings({...settings, whatsapp: local ? `+213 ${local}` : ''});
                      }}
                      placeholder="555 12 34 56"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                    value={settings.email || ''}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                    placeholder="contact@dahakauto.dz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse</label>
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                    value={settings.address || ''}
                    onChange={e => setSettings({...settings, address: e.target.value})}
                    placeholder="Zone Industrielle Oued Smar, Alger"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label>
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                    value={settings.facebook_url || ''}
                    onChange={e => setSettings({...settings, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                    value={settings.instagram_url || ''}
                    onChange={e => setSettings({...settings, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold mb-6">Page d'Accueil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre Principal</label>
                      <input 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.home_hero_title || ''}
                        onChange={e => setSettings({...settings, home_hero_title: e.target.value})}
                        placeholder="PIÈCES AUTO ORIGINALES"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sous-titre (Description)</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.home_hero_subtitle || ''}
                        onChange={e => setSettings({...settings, home_hero_subtitle: e.target.value})}
                        placeholder="Trouvez les meilleures pièces..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Hero (Principale)</label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.home_hero_image || ''}
                          onChange={e => setSettings({...settings, home_hero_image: e.target.value})}
                          placeholder="https://..."
                        />
                        <button 
                          type="button"
                          onClick={() => navigator.clipboard.writeText(settings.home_hero_image || '')}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                          title="Copier le lien"
                        >
                          <Copy size={16} />
                        </button>
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                          <span className="text-xs font-bold">Upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const formData = new FormData();
                                formData.append('image', e.target.files[0]);
                                try {
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                    body: formData
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setSettings({...settings, home_hero_image: data.url});
                                  } else {
                                    const text = await res.text();
                                    console.error('Upload failed:', res.status, text);
                                    alert('Upload failed: ' + res.status);
                                  }
                                } catch (err) {
                                  console.error('Upload failed', err);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      {settings.home_hero_image && (
                        <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20">
                          <img src={settings.home_hero_image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image "Pourquoi nous choisir"</label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.home_feature_image || ''}
                          onChange={e => setSettings({...settings, home_feature_image: e.target.value})}
                          placeholder="https://..."
                        />
                        <button 
                          type="button"
                          onClick={() => navigator.clipboard.writeText(settings.home_feature_image || '')}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                          title="Copier le lien"
                        >
                          <Copy size={16} />
                        </button>
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                          <span className="text-xs font-bold">Upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const formData = new FormData();
                                formData.append('image', e.target.files[0]);
                                try {
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                    body: formData
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setSettings({...settings, home_feature_image: data.url});
                                  }
                                } catch (err) {
                                  console.error('Upload failed', err);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      {settings.home_feature_image && (
                        <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20">
                          <img src={settings.home_feature_image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h3 className="text-xl font-bold mb-6">Page À Propos</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre Principal</label>
                      <input 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.about_title || ''}
                        onChange={e => setSettings({...settings, about_title: e.target.value})}
                        placeholder="DAHAK AUTO"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description Courte (Hero)</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.about_hero_text || ''}
                        onChange={e => setSettings({...settings, about_hero_text: e.target.value})}
                        placeholder="Leader dans la distribution..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Années d'expérience</label>
                        <input 
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.about_stats_years || ''}
                          onChange={e => setSettings({...settings, about_stats_years: e.target.value})}
                          placeholder="10+"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clients Satisfaits</label>
                        <input 
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.about_stats_clients || ''}
                          onChange={e => setSettings({...settings, about_stats_clients: e.target.value})}
                          placeholder="5000+"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Références</label>
                        <input 
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.about_stats_refs || ''}
                          onChange={e => setSettings({...settings, about_stats_refs: e.target.value})}
                          placeholder="1000+"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wilayas Livrées</label>
                        <input 
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.about_stats_wilayas || ''}
                          onChange={e => setSettings({...settings, about_stats_wilayas: e.target.value})}
                          placeholder="58"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                          value={settings.about_image || ''}
                          onChange={e => setSettings({...settings, about_image: e.target.value})}
                          placeholder="https://..."
                        />
                        <button 
                          type="button"
                          onClick={() => navigator.clipboard.writeText(settings.about_image || '')}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                          title="Copier le lien"
                        >
                          <Copy size={16} />
                        </button>
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                          <span className="text-xs font-bold">Upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const formData = new FormData();
                                formData.append('image', e.target.files[0]);
                                try {
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                    body: formData
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setSettings({...settings, about_image: data.url});
                                  }
                                } catch (err) {
                                  console.error('Upload failed', err);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      {settings.about_image && (
                        <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20">
                          <img src={settings.about_image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre Mission</label>
                      <input 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.about_mission_title || ''}
                        onChange={e => setSettings({...settings, about_mission_title: e.target.value})}
                        placeholder="Notre Mission"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description Mission</label>
                      <textarea 
                        rows={6}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-dahak-red focus:outline-none text-white"
                        value={settings.about_mission_text || ''}
                        onChange={e => setSettings({...settings, about_mission_text: e.target.value})}
                        placeholder="Chez DAHAK AUTO..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-gray-500 italic text-center">
                  Les modifications sont enregistrées automatiquement.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dahak-gray border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-6">{isEditing ? 'Modifier Produit' : 'Nouveau Produit'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                  <input 
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                    value={currentProduct.name || ''}
                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marque</label>
                  <input 
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                    value={currentProduct.brand || ''}
                    onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                  value={currentProduct.description || ''}
                  onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix (DZD)</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                    value={currentProduct.price || ''}
                    onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catégorie</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 appearance-none focus:border-dahak-red focus:outline-none"
                      value={currentProduct.category_id || (categories.length > 0 ? categories[0].id : '')}
                      onChange={e => setCurrentProduct({...currentProduct, category_id: parseInt(e.target.value)})}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Compatibilité</label>
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                    value={currentProduct.compatible_models || ''}
                    onChange={e => setCurrentProduct({...currentProduct, compatible_models: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantité (Stock)</label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setCurrentProduct(p => ({ ...p, quantity: Math.max(0, (p.quantity || 1) - 1) }))}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-center focus:border-dahak-red focus:outline-none"
                      value={currentProduct.quantity || 1}
                      onChange={e => setCurrentProduct({...currentProduct, quantity: parseInt(e.target.value)})}
                    />
                    <button 
                      type="button"
                      onClick={() => setCurrentProduct(p => ({ ...p, quantity: (p.quantity || 1) + 1 }))}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">État</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 appearance-none focus:border-dahak-red focus:outline-none"
                      value={currentProduct.condition || 'New'}
                      onChange={e => setCurrentProduct({...currentProduct, condition: e.target.value as any})}
                    >
                      <option value="New">Neuf</option>
                      <option value="Used">Occasion</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Status</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 appearance-none focus:border-dahak-red focus:outline-none"
                      value={currentProduct.stock_status || 'In Stock'}
                      onChange={e => setCurrentProduct({...currentProduct, stock_status: e.target.value as any})}
                    >
                      <option value="In Stock">En Stock</option>
                      <option value="Out of Stock">Épuisé</option>
                      <option value="On Order">Sur Commande</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Images du Produit</label>
                <div className="space-y-3">
                  {(currentProduct.images || ['']).map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none text-white text-sm"
                        placeholder="URL de l'image..."
                        value={img}
                        onChange={e => {
                          const newImages = [...(currentProduct.images || [''])];
                          newImages[idx] = e.target.value;
                          setCurrentProduct({...currentProduct, images: newImages});
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = (currentProduct.images || ['']).filter((_, i) => i !== idx);
                          if (newImages.length === 0) newImages.push('');
                          setCurrentProduct({...currentProduct, images: newImages});
                        }}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash size={16} />
                      </button>
                      {idx === (currentProduct.images || ['']).length - 1 && (
                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentProduct({...currentProduct, images: [...(currentProduct.images || ['']), '']});
                          }}
                          className="p-2 bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded-lg transition-colors"
                          title="Ajouter une image"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-[10px] font-bold uppercase">Upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const formData = new FormData();
                              formData.append('image', e.target.files[0]);
                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                  body: formData
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  const newImages = [...(currentProduct.images || [''])];
                                  newImages[idx] = data.url;
                                  setCurrentProduct({...currentProduct, images: newImages});
                                }
                              } catch (err) {
                                console.error('Upload failed', err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {(currentProduct.images || []).filter(img => img).map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/20">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-dahak-red hover:bg-red-600 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dahak-gray border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold mb-6">Nouvelle Catégorie</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                <input 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                  value={currentCategory.name || ''}
                  onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 focus:border-dahak-red focus:outline-none"
                    placeholder="https://..."
                    value={currentCategory.image_url || ''}
                    onChange={e => setCurrentCategory({...currentCategory, image_url: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => navigator.clipboard.writeText(currentCategory.image_url || '')}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                    title="Copier le lien"
                  >
                    <Copy size={16} />
                  </button>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold">Upload</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const formData = new FormData();
                          formData.append('image', e.target.files[0]);
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                              body: formData
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCurrentCategory({...currentCategory, image_url: data.url});
                            }
                          } catch (err) {
                            console.error('Upload failed', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-dahak-red hover:bg-red-600 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dahak-gray border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Confirmer la suppression</h3>
            <p className="text-gray-400 mb-6">
              {deleteConfirmation.type === 'product' && 'Êtes-vous sûr de vouloir supprimer ce produit ? Cela supprimera également les réservations associées.'}
              {deleteConfirmation.type === 'category' && 'Êtes-vous sûr de vouloir supprimer cette catégorie ?'}
              {deleteConfirmation.type === 'reservation' && 'Êtes-vous sûr de vouloir supprimer cette réservation ?'}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-lg bg-dahak-red hover:bg-red-600 text-white font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
