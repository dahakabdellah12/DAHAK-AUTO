import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';

export default function WhatsApp() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const whatsappNumber = settings.whatsapp?.replace(/\D/g, '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';

  if (!settings.whatsapp && !settings.phone) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Contact WhatsApp non disponible</h1>
        <p className="text-gray-400">Le numéro WhatsApp n'a pas encore été configuré.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      <div className="bg-dahak-gray border border-white/10 p-12 rounded-3xl max-w-lg w-full shadow-2xl">
        <div className="w-24 h-24 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Phone size={48} className="text-[#25D366]" />
        </div>
        
        <h1 className="text-4xl font-display font-bold mb-4">Contactez-nous sur WhatsApp</h1>
        <p className="text-gray-400 mb-8 text-lg">
          Cliquez sur le bouton ci-dessous pour démarrer une conversation avec notre équipe commerciale.
        </p>

        {whatsappNumber && (
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-xl shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={24} />
            Ouvrir WhatsApp
          </a>
        )}

        {settings.phone && settings.phone.replace(/\D/g, '').length === 12 && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500 mb-2">Ou ajoutez manuellement notre numéro :</p>
            <p className="text-2xl font-mono font-bold text-white tracking-wider">{settings.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
}
