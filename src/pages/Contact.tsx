import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [settings, setSettings] = useState<any>({});

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen pt-[120px] pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Contactez-nous</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Une question ? Besoin d'un devis ? Notre équipe est à votre écoute.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-dahak-gray border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-display font-bold mb-6">Nos Coordonnées</h3>
            
            <div className="space-y-6">
              {settings.address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Adresse</h4>
                    <p className="text-gray-400">{settings.address}</p>
                  </div>
                </div>
              )}

              {settings.phone && settings.phone.replace(/\D/g, '').length === 12 && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Téléphone</h4>
                    <p className="text-gray-400">{settings.phone}</p>
                  </div>
                </div>
              )}

              {settings.email && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Email</h4>
                    <p className="text-gray-400">{settings.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-dahak-red/10 flex items-center justify-center text-dahak-red shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Horaires</h4>
                  <p className="text-gray-400">Sam - Jeu: 08:00 - 18:00</p>
                  <p className="text-gray-400">Vendredi: Fermé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="h-64 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
            <iframe 
              src={settings.google_maps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.593635039304!2d3.1365!3d36.725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e526065555555%3A0x0!2sOued+Smar!5e0!3m2!1sen!2sdz!4v1620000000000!5m2!1sen!2sdz"} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              className="grayscale opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-dahak-gray border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-display font-bold mb-6">Envoyez-nous un message</h3>
          
          {status === 'success' ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-8 text-center">
              <h4 className="text-2xl font-bold text-green-400 mb-2">Message Envoyé !</h4>
              <p className="text-gray-300">Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom complet</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 focus:border-dahak-red focus:outline-none transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 focus:border-dahak-red focus:outline-none transition-colors"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Téléphone</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 focus:border-dahak-red focus:outline-none transition-colors"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 focus:border-dahak-red focus:outline-none transition-colors"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-dahak-red hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Envoi...' : <><Send size={18} /> Envoyer le message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
