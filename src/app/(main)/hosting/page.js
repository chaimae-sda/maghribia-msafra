'use client';

import { useState } from 'react';
import { MapPin, Star, Wifi, Users, Calendar, Heart, BadgeCheck, Search, Filter, ChevronDown, QrCode, Clock } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { hosts } from '@/data/mock/hosts';
import styles from './page.module.css';

export default function HostingPage() {
  const [selectedCity, setSelectedCity] = useState('all');
  const [showQR, setShowQR] = useState(false);
  const cities = ['all', 'Fès', 'Essaouira', 'Marrakech', 'Rabat', 'Tanger', 'Casablanca'];

  return (
    <div className={styles.hosting}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.header_text}>
          <h1>🏡 Hébergement Solidaire</h1>
          <p>Trouvez un accueil chaleureux chez des femmes de confiance partout au Maroc</p>
        </div>
        <Button variant="primary" onClick={() => setShowQR(true)}>
          <QrCode size={18} />
          Check-in QR
        </Button>
      </div>

      {/* Search & filters */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={20} />
          <input type="text" placeholder="Rechercher une ville ou un quartier..." />
        </div>
        <div className={styles.cityFilters}>
          {cities.map(c => (
            <button
              key={c}
              className={`${styles.cityFilter} ${selectedCity === c ? styles.cityFilter_active : ''}`}
              onClick={() => setSelectedCity(c)}
            >
              {c === 'all' ? 'Toutes les villes' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Host Grid */}
      <div className={styles.hostGrid}>
        {hosts
          .filter(h => selectedCity === 'all' || h.city === selectedCity)
          .map(host => (
          <article key={host.id} className={styles.hostCard}>
            <div className={styles.hostCard_image}>
              <img src={host.photos[0]} alt={host.name} />
              <div className={styles.hostCard_overlay}>
                {host.available ? (
                  <Badge variant="jade" size="sm" dot>Disponible</Badge>
                ) : (
                  <Badge variant="default" size="sm">Prochaine dispo : {host.nextAvailable}</Badge>
                )}
              </div>
              <button className={styles.hostCard_fav}>
                <Heart size={18} />
              </button>
            </div>
            <div className={styles.hostCard_body}>
              <div className={styles.hostCard_top}>
                <div className={styles.hostCard_user}>
                  <Avatar alt={host.name} size="md" />
                  <div>
                    <div className={styles.hostCard_name}>
                      {host.name}
                      <BadgeCheck size={14} className={styles.verified} />
                    </div>
                    <Badge variant="gold" size="sm">{host.badge}</Badge>
                  </div>
                </div>
                <div className={styles.hostCard_rating}>
                  <Star size={16} fill="var(--saffron)" color="var(--saffron)" />
                  <strong>{host.rating}</strong>
                  <span>({host.reviewCount})</span>
                </div>
              </div>

              <div className={styles.hostCard_location}>
                <MapPin size={14} />
                <span>{host.city}, {host.neighborhood}</span>
              </div>

              <p className={styles.hostCard_desc}>{host.description}</p>

              <div className={styles.hostCard_amenities}>
                {host.amenities.slice(0, 4).map((a, i) => (
                  <span key={i} className={styles.amenity}>{a}</span>
                ))}
              </div>

              <div className={styles.hostCard_footer}>
                <div className={styles.hostCard_meta}>
                  <span><Users size={14} /> Max {host.maxGuests} {host.maxGuests > 1 ? 'personnes' : 'personne'}</span>
                  <span><Clock size={14} /> Rép. {host.responseTime}</span>
                </div>
                <Button variant={host.available ? 'primary' : 'ghost'} size="sm" disabled={!host.available}>
                  {host.available ? 'Réserver' : 'Indisponible'}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className={styles.modal_overlay} onClick={() => setShowQR(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>📱 Check-in / Check-out</h2>
            <p>Scannez le QR code de votre hôte pour confirmer votre arrivée ou départ en toute sécurité.</p>
            <div className={styles.qr_placeholder}>
              <QrCode size={120} strokeWidth={1} />
              <span>Votre QR Code personnel</span>
            </div>
            <div className={styles.modal_actions}>
              <Button variant="primary" fullWidth>Scanner le QR de l'hôte</Button>
              <Button variant="ghost" fullWidth onClick={() => setShowQR(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
