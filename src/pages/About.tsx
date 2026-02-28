import React, { useState, useEffect } from 'react';
import { Shield, Users, Wrench, Award } from 'lucide-react';

export default function About() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-20">
        <span className="text-dahak-red font-bold tracking-widest uppercase text-sm">Notre Histoire</span>
        <h1 className="text-4xl md:text-6xl font-display font-bold mt-2 mb-6">{settings.about_title || 'DAHAK AUTO'}</h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          {settings.about_hero_text || 'Leader dans la distribution de pièces automobiles en Algérie depuis plus de 10 ans. Nous nous engageons à fournir qualité, fiabilité et expertise à nos clients.'}
        </p>
      </div>

      {/* Stats - Only show if data is entered */}
      {(settings.about_stats_years || settings.about_stats_clients || settings.about_stats_refs || settings.about_stats_wilayas) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-y border-white/5 py-12">
          {settings.about_stats_years && (
            <div className="text-center">
              <span className="block text-4xl font-display font-bold text-white mb-2">{settings.about_stats_years}</span>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Années d'expérience</span>
            </div>
          )}
          {settings.about_stats_clients && (
            <div className="text-center">
              <span className="block text-4xl font-display font-bold text-white mb-2">{settings.about_stats_clients}</span>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Clients Satisfaits</span>
            </div>
          )}
          {settings.about_stats_refs && (
            <div className="text-center">
              <span className="block text-4xl font-display font-bold text-white mb-2">{settings.about_stats_refs}</span>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Références</span>
            </div>
          )}
          {settings.about_stats_wilayas && (
            <div className="text-center">
              <span className="block text-4xl font-display font-bold text-white mb-2">{settings.about_stats_wilayas}</span>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Wilayas Livrées</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div className="relative">
          <div className="absolute -inset-4 bg-dahak-red/10 rounded-2xl transform -rotate-3" />
          {settings.about_image && (
            <img 
              src={settings.about_image}
              alt="Auto Parts Store" 
              className="rounded-xl shadow-2xl relative z-10 w-full"
            />
          )}
        </div>
        
        <div className="space-y-8">
          <h2 className="text-3xl font-display font-bold">{settings.about_mission_title || 'Notre Mission'}</h2>
          <p className="text-gray-400 leading-relaxed whitespace-pre-line">
            {settings.about_mission_text || "Chez DAHAK AUTO, notre mission est simple : garder votre véhicule en parfait état de marche. Nous comprenons l'importance de la fiabilité et de la sécurité sur la route. C'est pourquoi nous ne proposons que des pièces rigoureusement sélectionnées, qu'elles soient neuves d'origine ou d'occasion certifiée.\n\nNotre équipe d'experts est là pour vous guider et s'assurer que vous trouvez exactement la pièce dont vous avez besoin, au meilleur prix du marché."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="flex gap-4">
              <Award className="text-dahak-red shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Qualité Garantie</h4>
                <p className="text-sm text-gray-500">Pièces testées et vérifiées.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="text-dahak-red shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Service Client</h4>
                <p className="text-sm text-gray-500">Assistance personnalisée.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
