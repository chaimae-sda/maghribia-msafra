import styles from '../legal.module.css';

export const metadata = {
  title: 'Politique de Confidentialité | Maghribia Msafra',
  description: 'Comment nous protégeons vos données personnelles conformément à la loi 09-08 au Maroc.',
};

export default function PrivacyPage() {
  return (
    <>
      <span className={styles.badge}>Confidentialité</span>
      <h1>Politique de Confidentialité</h1>
      <small className={styles.date}>Dernière mise à jour : 13 Avril 2026</small>

      <section>
        <h2>1. Collecte des Données</h2>
        <p>
          Maghribia Msafra collecte les données nécessaires au bon fonctionnement du service et à la sécurité 
          de ses membres : nom, prénom, email, numéro de téléphone, ville, photo de profil et documents 
          d'identité (pour vérification uniquement).
        </p>
      </section>

      <section>
        <h2>2. Utilisation des Données</h2>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul>
          <li>Vérifier votre identité et maintenir la sécurité du réseau féminin.</li>
          <li>Faciliter la mise en relation pour l'hébergement et les voyages.</li>
          <li>Vous envoyer des notifications importantes concernant vos réservations.</li>
        </ul>
      </section>

      <section>
        <h2>3. Loi 09-08 et CNDP</h2>
        <p>
          Conformément à la loi n° 09-08 relative à la protection des personnes physiques à l'égard du 
          traitement des données à caractère personnel au Maroc, vous disposez d'un droit d'accès, 
          de rectification et d'opposition au traitement de vos données personnelles.
        </p>
      </section>

      <section>
        <h2>4. Partage des Données</h2>
        <p>
          Maghribia Msafra ne vend, ne loue, ni ne partage vos données personnelles avec des tiers à 
          des fins commerciales. Vos coordonnées (téléphone/adresse) ne sont partagées avec une autre 
          membre <strong>qu'après</strong> votre acceptation explicite d'une demande d'hébergement ou de voyage.
        </p>
      </section>

      <section>
        <h2>5. Cookies et LocalStorage</h2>
        <p>
          Nous utilisons des cookies techniques uniquement pour maintenir votre session connectée et 
          mémoriser vos préférences d'affichage (comme le mode sombre).
        </p>
      </section>
    </>
  );
}
