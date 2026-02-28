import React, { useState, useEffect } from 'react';

export default function Privacy() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold mb-8">Politique de Confidentialité</h1>
      
      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            Chez DAHAK AUTO, nous accordons une grande importance à la confidentialité de vos données. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations personnelles 
            lorsque vous utilisez notre site web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Collecte des Informations</h2>
          <p>Nous collectons les informations suivantes lorsque vous effectuez une réservation ou nous contactez :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nom et prénom</li>
            <li>Numéro de téléphone</li>
            <li>Adresse email (optionnel)</li>
            <li>Ville / Wilaya</li>
            <li>Informations sur les pièces recherchées</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Utilisation des Données</h2>
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Traiter vos commandes et réservations</li>
            <li>Vous contacter concernant la disponibilité des produits</li>
            <li>Améliorer nos services</li>
          </ul>
          <p className="mt-4">
            Nous ne vendons ni ne partageons vos informations personnelles avec des tiers à des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé, 
            modification, divulgation ou destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Vos Droits</h2>
          <p>
            Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
            Pour exercer ces droits, veuillez nous contacter via la page Contact.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter
            {settings.email ? (
              <> à l'adresse suivante : {settings.email} ou</>
            ) : (
              <></>
            )} via notre formulaire de contact.
          </p>
        </section>
      </div>
    </div>
  );
}
