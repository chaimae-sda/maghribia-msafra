'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, Star, Calendar, Shield, ChevronRight, CreditCard, BadgeCheck, Heart, Tag } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { trips } from '@/data/mock/trips';
import styles from './page.module.css';

export default function ShopPage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className={styles.shop}>
      {/* Header */}
      <div className={styles.header}>
        <h1>✈️ Voyages Organisés</h1>
        <p>Des circuits exclusifs entre femmes, avec paiement sécurisé et garantie</p>
      </div>

      {/* Trust Banner */}
      <div className={styles.trustBanner}>
        <div className={styles.trustItem}>
          <Shield size={20} />
          <span>Paiement sécurisé</span>
        </div>
        <div className={styles.trustItem}>
          <BadgeCheck size={20} />
          <span>Organisatrices vérifiées</span>
        </div>
        <div className={styles.trustItem}>
          <CreditCard size={20} />
          <span>Remboursement garanti</span>
        </div>
      </div>

      {/* Trips Grid */}
      <div className={styles.tripGrid}>
        {trips.map(trip => (
          <article key={trip.id} className={styles.tripCard}>
            <div className={styles.tripCard_image}>
              <img src={trip.image} alt={trip.title} />
              <div className={styles.tripCard_badges}>
                {trip.tags.map(tag => (
                  <Badge key={tag} variant={tag === 'Populaire' ? 'rose' : 'majorelle'} size="sm">{tag}</Badge>
                ))}
              </div>
              <button className={styles.tripCard_fav}>
                <Heart size={18} />
              </button>
              {trip.originalPrice && (
                <div className={styles.tripCard_discount}>
                  <Tag size={14} />
                  <span>-{Math.round((1 - trip.price / trip.originalPrice) * 100)}%</span>
                </div>
              )}
            </div>
            <div className={styles.tripCard_body}>
              <h3 className={styles.tripCard_title}>{trip.title}</h3>
              
              <div className={styles.tripCard_meta}>
                <span><MapPin size={14} /> {trip.cities.join(' → ')}</span>
                <span><Clock size={14} /> {trip.duration}</span>
                <span><Calendar size={14} /> Départ: {trip.departureDate}</span>
              </div>

              <p className={styles.tripCard_desc}>{trip.description}</p>

              <div className={styles.tripCard_includes}>
                {trip.includes.map((inc, i) => (
                  <span key={i} className={styles.include_tag}>✓ {inc}</span>
                ))}
              </div>

              <div className={styles.tripCard_footer}>
                <div className={styles.tripCard_pricing}>
                  <div className={styles.price_main}>
                    <span className={styles.price_amount}>{trip.price.toLocaleString()}</span>
                    <span className={styles.price_currency}> MAD</span>
                  </div>
                  {trip.originalPrice && (
                    <span className={styles.price_original}>{trip.originalPrice.toLocaleString()} MAD</span>
                  )}
                  <span className={styles.price_person}>/ personne</span>
                </div>
                <div className={styles.tripCard_right}>
                  <div className={styles.tripCard_rating}>
                    <Star size={14} fill="var(--saffron)" color="var(--saffron)" />
                    <strong>{trip.rating}</strong>
                    <span>({trip.reviewCount})</span>
                  </div>
                  <div className={styles.tripCard_spots}>
                    <Users size={14} />
                    <span>{trip.maxParticipants - trip.currentParticipants} places restantes</span>
                  </div>
                </div>
              </div>

              <div className={styles.tripCard_organizer}>
                <Avatar alt={trip.organizer.name} size="sm" />
                <span>Par <strong>{trip.organizer.name}</strong></span>
                <BadgeCheck size={14} className={styles.verified} />
              </div>

              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => { setSelectedTrip(trip); setShowPayment(true); }}
              >
                Réserver ce voyage
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedTrip && (
        <div className={styles.modal_overlay} onClick={() => setShowPayment(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>💳 Réservation</h2>
            <div className={styles.payment_summary}>
              <h3>{selectedTrip.title}</h3>
              <div className={styles.payment_row}>
                <span>Prix par personne</span>
                <strong>{selectedTrip.price.toLocaleString()} MAD</strong>
              </div>
              <div className={styles.payment_row}>
                <span>Frais de service</span>
                <strong>0 MAD</strong>
              </div>
              <div className={`${styles.payment_row} ${styles.payment_total}`}>
                <span>Total</span>
                <strong>{selectedTrip.price.toLocaleString()} MAD</strong>
              </div>
            </div>

            <div className={styles.payment_method}>
              <h4>Mode de paiement</h4>
              <div className={styles.payment_options}>
                <label className={styles.payment_option}>
                  <input type="radio" name="payment" defaultChecked />
                  <span>💳 Carte bancaire (CMI)</span>
                </label>
                <label className={styles.payment_option}>
                  <input type="radio" name="payment" />
                  <span>📱 Paypal</span>
                </label>
              </div>
            </div>

            <div className={styles.payment_escrow}>
              <Shield size={16} />
              <span>Votre paiement est protégé par notre système de séquestre. L'organisatrice ne reçoit les fonds qu'après la fin du voyage.</span>
            </div>

            <div className={styles.modal_actions}>
              <Button variant="primary" size="lg" fullWidth>
                <CreditCard size={18} />
                Payer {selectedTrip.price.toLocaleString()} MAD
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setShowPayment(false)}>Annuler</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
