import styles from '../legal.module.css';

export const metadata = {
  title: 'Conditions d\'Utilisation | Maghribia Msafra',
  description: 'Les règles de vie et conditions légales pour utiliser la plateforme Maghribia Msafra.',
};

export default function TermsPage() {
  return (
    <>
      <span className={styles.badge}>Règles de Vie</span>
      <h1>Conditions d'Utilisation</h1>
      <small className={styles.date}>Dernière mise à jour : 13 Avril 2026</small>

      <section>
        <h2>1. Objet de la Plateforme</h2>
        <p>
          Maghribia Msafra est une plateforme de mise en relation destinée exclusivement aux femmes 
          résidant au Maroc ou issues de la diaspora marocaine, souhaitant voyager et s'entraider.
        </p>
      </section>

      <section>
        <h2>2. Condition de Mixité (100% Féminin)</h2>
        <p>
          L'accès à la plateforme est <strong>strictement réservé aux femmes</strong>. Toute tentative 
          d'inscription par un individu de sexe masculin, sous une fausse identité ou non, 
          entraînera un bannissement immédiat et définitif. Les vérifications KYC sont l'outil principal 
          de respect de cette clause.
        </p>
      </section>

      <section>
        <h2>3. Responsabilité de l'Hébergement</h2>
        <p>
          Maghribia Msafra facilite la mise en relation mais n'intervient pas dans les accords privés 
          entre hôtes et voyageuses. L'hébergement solidaire repose sur la gratuité et la confiance. 
          L'hôte se réserve le droit d'accepter ou de refuser une demande selon ses préférences.
        </p>
      </section>

      <section>
        <h2>4. Comportement et Éthique</h2>
        <p>Les membres s'engagent à :</p>
        <ul>
          <li>Respecter les valeurs de solidarité et de bienveillance de la communauté.</li>
          <li>Ne pas utiliser la plateforme à des fins de prospection commerciale non sollicitée.</li>
          <li>Signaler tout comportement suspect ou inapproprié à l'équipe de modération.</li>
        </ul>
      </section>

      <section>
        <h2>5. Résiliation</h2>
        <p>
          Maghribia Msafra se réserve le droit de suspendre ou supprimer le compte de toute membre 
          ne respectant pas les présentes conditions, sans préavis.
        </p>
      </section>
    </>
  );
}
