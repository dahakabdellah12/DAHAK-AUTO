import React, { useState, useEffect } from 'react';

export default function Terms() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className="min-h-screen pt-[120px] pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold mb-8">Conditions d'Utilisation</h1>
      
      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Acceptation des Conditions</h2>
          <p>
            En accédant et en utilisant le site web de DAHAK AUTO, vous acceptez d'être lié par les présentes conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Services Proposés</h2>
          <p>
            DAHAK AUTO est une plateforme de présentation et de réservation de pièces détachées automobiles. 
            Le site ne permet pas l'achat direct en ligne. Les transactions finales s'effectuent en magasin ou à la livraison.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Disponibilité des Produits</h2>
          <p>
            Bien que nous nous efforcions de maintenir notre catalogue à jour, la disponibilité des produits affichée sur le site 
            est indicative. Une confirmation de réservation vous sera envoyée pour valider la disponibilité réelle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Prix</h2>
          <p>
            Les prix affichés sont en Dinar Algérien (DZD) et sont susceptibles d'être modifiés sans préavis. 
            Le prix applicable est celui en vigueur au moment de la confirmation de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Réservations</h2>
          <p>
            Toute réservation effectuée sur le site constitue une intention d'achat et non un contrat de vente définitif. 
            La vente n'est conclue qu'au moment du paiement et de la remise de la marchandise.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Propriété Intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, logos) est la propriété exclusive de DAHAK AUTO 
            ou de ses partenaires et est protégé par les lois sur la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Limitation de Responsabilité</h2>
          <p>
            DAHAK AUTO ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site 
            ou de l'impossibilité de l'utiliser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter
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
