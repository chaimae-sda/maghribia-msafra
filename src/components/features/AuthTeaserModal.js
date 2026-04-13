'use client';

import { X, Heart, MessageCircle, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './AuthTeaserModal.module.css';

export default function AuthTeaserModal({ onClose, action = 'interagir' }) {
  const messages = {
    like: "Aimez cette aventure !",
    comment: "Partagez votre avis !",
    share: "Partagez ce voyage !",
    story: "Découvrez les stories !",
    default: "Rejoignez la communauté !"
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.icon_ring}>
          <div className={styles.icon_inner}>
            <Heart className={styles.icon_heart} size={32} />
            <MessageCircle className={styles.icon_msg} size={32} />
            <Users className={styles.icon_users} size={32} />
          </div>
        </div>

        <h2 className={styles.title}>{messages[action] || messages.default}</h2>
        <p className={styles.desc}>
          Pour {action === 'interagir' ? "interagir avec les membres" : action}, connectez-vous ou rejoignez gratuitement Maghribia Msafra.
        </p>

        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <div className={styles.check}>✓</div>
            <span>Vérification d'identité sécurisée</span>
          </div>
          <div className={styles.benefit}>
            <div className={styles.check}>✓</div>
            <span>Communauté 100% féminine</span>
          </div>
          <div className={styles.benefit}>
            <div className={styles.check}>✓</div>
            <span>Échanges et conseils entre voyageuses</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/register" className={styles.btn_primary}>
            S'inscrire gratuitement <ArrowRight size={18} />
          </Link>
          <Link href="/login" className={styles.btn_secondary}>
            Déjà membre ? Se connecter
          </Link>
        </div>

        <p className={styles.footer}>
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </div>
  );
}
