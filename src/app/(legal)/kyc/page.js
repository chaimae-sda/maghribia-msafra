import styles from '../legal.module.css';
import { Shield, UserCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Vérification KYC | Maghribia Msafra',
  description: 'Notre processus de vérification sécurisé pour garantir une communauté 100% féminine et sûre.',
};

export default function KYCPage() {
  return (
    <>
      <span className={styles.badge}>Sécurité Radicale</span>
      <h1>Vérification KYC</h1>
      <small className={styles.date}>Dernière mise à jour : 13 Avril 2026</small>

      <section>
        <h2><Shield size={24} /> Pourquoi le KYC ?</h2>
        <p>
          Chez Maghribia Msafra, la sécurité est notre priorité absolue. Pour maintenir une communauté 
          exclusivement féminine et prévenir toute forme d'usurpation d'identité, nous imposons une 
          vérification d'identité (Know Your Customer) à toutes nos membres.
        </p>
      </section>

      <section>
        <h2><UserCheck size={24} /> Le Processus de Vérification</h2>
        <p>Le processus est simple, rapide et entièrement sécurisé :</p>
        <ul>
          <li><strong>Preuve d'identité :</strong> Une photo de votre CIN (Carte d'Identité Nationale) ou Passeport marocain.</li>
          <li><strong>Vérification Biométrique :</strong> Un selfie "vivant" pour comparer votre visage à celui sur la pièce d'identité.</li>
          <li><strong>Validation Manuelle :</strong> Notre équipe de modération vérifie chaque compte sous 24h.</li>
        </ul>
      </section>

      <section>
        <h2><Lock size={24} /> Protection de vos Documents</h2>
        <p>
          Vos documents d'identité sont chiffrés et stockés sur des serveurs sécurisés. 
          Ils ne sont <strong>jamais</strong> partagés avec d'autres membres ou des tiers. 
          Une fois la vérification terminée, votre badge "Vérifiée" apparaît sur votre profil, 
          instaurant une confiance mutuelle indispensable pour l'hébergement et le voyage.
        </p>
      </section>

      <section>
        <h2>Critères de Refus</h2>
        <p>Un compte peut être refusé si :</p>
        <ul>
          <li>Le document est illisible ou expiré.</li>
          <li>Le profil ne correspond manifestement pas à une identité féminine.</li>
          <li>L'utilisatrice tente d'utiliser une photo tierce pour la vérification biométrique.</li>
        </ul>
      </section>
    </>
  );
}
