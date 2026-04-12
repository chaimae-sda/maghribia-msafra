'use client';

import { Settings, MapPin, Star, Calendar, Shield, Award, Heart, Eye, Globe, BadgeCheck, Edit2, LogOut, Camera, ChevronRight } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { currentUser } from '@/data/mock/users';
import styles from './page.module.css';

const badges = [
  { name: 'Exploratrice', icon: '🧭', desc: '10+ voyages effectués', earned: true },
  { name: 'Hôte en Or', icon: '🏡', desc: '5+ hébergements offerts', earned: true },
  { name: 'Ambassadrice', icon: '👑', desc: '50+ avis positifs', earned: false },
  { name: 'Globe-trotteuse', icon: '🌍', desc: 'Visité 10+ villes', earned: true },
  { name: 'Mentore', icon: '🤝', desc: 'Aidé 20+ voyageuses', earned: false },
  { name: 'Photographe', icon: '📸', desc: '100+ photos partagées', earned: true },
];

const travelHistory = [
  { city: 'Chefchaouen', date: 'Mars 2024', type: 'Solo', rating: 5 },
  { city: 'Essaouira', date: 'Fév 2024', type: 'Groupe', rating: 4 },
  { city: 'Marrakech', date: 'Jan 2024', type: 'Hébergement', rating: 5 },
  { city: 'Fès', date: 'Déc 2023', type: 'Événement', rating: 5 },
];

const reviews = [
  { from: 'Fatima Z.', text: 'Amina est une voyageuse exceptionnelle ! Très respectueuse et pleine de bonne humeur.', rating: 5, date: 'Mars 2024' },
  { from: 'Nour E.', text: 'Super compagne de voyage. Je recommande à 100% !', rating: 5, date: 'Fév 2024' },
  { from: 'Salma I.', text: 'Amina a été une invitée parfaite. Bienvenue chez moi quand tu veux !', rating: 5, date: 'Jan 2024' },
];

export default function ProfilePage() {
  return (
    <div className={styles.profile}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeader_bg}>
          <img src="/travel-1.png" alt="Cover" />
          <div className={styles.profileHeader_overlay} />
        </div>
        <div className={styles.profileHeader_content}>
          <div className={styles.profileHeader_avatar}>
            <Avatar alt={currentUser.name} size="2xl" />
            <button className={styles.editAvatar}>
              <Camera size={16} />
            </button>
          </div>
          <div className={styles.profileHeader_info}>
            <div className={styles.profileHeader_name}>
              <h1>{currentUser.name}</h1>
              <BadgeCheck size={22} className={styles.verified} />
            </div>
            <span className={styles.profileHeader_username}>{currentUser.username}</span>
            <p className={styles.profileHeader_bio}>{currentUser.bio}</p>
            <div className={styles.profileHeader_meta}>
              <span><MapPin size={14} /> {currentUser.city}</span>
              <span><Calendar size={14} /> Membre depuis {currentUser.joinDate}</span>
              <span><Globe size={14} /> {currentUser.languages.join(', ')}</span>
            </div>
          </div>
          <div className={styles.profileHeader_actions}>
            <Button variant="secondary" size="sm" icon={<Edit2 size={16} />}>Modifier</Button>
            <Button variant="ghost" size="sm" icon={<Settings size={16} />}>Paramètres</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong>{currentUser.tripsCount}</strong>
          <span>Voyages</span>
        </div>
        <div className={styles.stat}>
          <strong>{currentUser.hostingCount}</strong>
          <span>Hébergements</span>
        </div>
        <div className={styles.stat}>
          <strong>{currentUser.rating}</strong>
          <span>Note ★</span>
        </div>
        <div className={styles.stat}>
          <strong>{currentUser.interests.length}</strong>
          <span>Intérêts</span>
        </div>
      </div>

      <div className={styles.profileGrid}>
        {/* Badges */}
        <section className={styles.section}>
          <h2>🏅 Badges de Confiance</h2>
          <div className={styles.badgesGrid}>
            {badges.map((badge, i) => (
              <div key={i} className={`${styles.badgeCard} ${!badge.earned ? styles.badgeCard_locked : ''}`}>
                <span className={styles.badgeCard_icon}>{badge.icon}</span>
                <strong>{badge.name}</strong>
                <span className={styles.badgeCard_desc}>{badge.desc}</span>
                {badge.earned ? (
                  <Badge variant="jade" size="sm">✓ Obtenu</Badge>
                ) : (
                  <Badge variant="default" size="sm">🔒 Verrouillé</Badge>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Travel History */}
        <section className={styles.section}>
          <h2>🗺️ Historique de Voyages</h2>
          <div className={styles.historyList}>
            {travelHistory.map((trip, i) => (
              <div key={i} className={styles.historyItem}>
                <div className={styles.historyItem_icon}>📍</div>
                <div className={styles.historyItem_info}>
                  <strong>{trip.city}</strong>
                  <span>{trip.date} • {trip.type}</span>
                </div>
                <div className={styles.historyItem_rating}>
                  {[...Array(trip.rating)].map((_, j) => (
                    <Star key={j} size={12} fill="var(--saffron)" color="var(--saffron)" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className={styles.section}>
          <h2>💬 Avis Reçus</h2>
          <div className={styles.reviewsList}>
            {reviews.map((review, i) => (
              <div key={i} className={styles.reviewCard}>
                <div className={styles.reviewCard_header}>
                  <Avatar alt={review.from} size="sm" />
                  <div>
                    <strong>{review.from}</strong>
                    <span>{review.date}</span>
                  </div>
                  <div className={styles.reviewCard_stars}>
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={12} fill="var(--saffron)" color="var(--saffron)" />
                    ))}
                  </div>
                </div>
                <p>{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className={styles.section}>
          <h2>❤️ Centres d'intérêt</h2>
          <div className={styles.interests}>
            {currentUser.interests.map((interest, i) => (
              <Badge key={i} variant="majorelle" size="md">{interest}</Badge>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
