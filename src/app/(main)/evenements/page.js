'use client';

import { useState } from 'react';
import { Ticket, ExternalLink, MapPin, Calendar, Loader2, Star, BadgeCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

const SPONSORED_EVENTS = [
  {
    id: 'e1',
    title: 'Festival Gnaoua & Musiques du Monde 2026',
    partner: 'Guichet.ma',
    destination: 'Essaouira',
    date: '2026-06-25',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
    link: 'https://www.guichet.ma/',
    price: 'A partir de 400 MAD',
    sponsored: true
  },
  {
    id: 'e2',
    title: 'Jazzablanca Festival',
    partner: 'Jazzablanca Officiel',
    destination: 'Casablanca',
    date: '2026-07-02',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    link: 'https://www.jazzablanca.com/billetterie',
    price: 'Pass 3 Jours : 1200 MAD',
    sponsored: true
  },
  {
    id: 'e3',
    title: 'Moga Festival 2026 (Electro)',
    partner: 'Shotgun.live',
    destination: 'Essaouira',
    date: '2026-09-30',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    link: 'https://shotgun.live/fr/',
    price: 'A partir de 500 MAD',
    sponsored: true
  }
];

export default function EvenementsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🎫 Événements & Billetterie</h1>
          <p>Profitez de nos offres partenaires : Concerts, Coworking, Conférences et plus encore.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {SPONSORED_EVENTS.map(event => (
          <article key={event.id} className={styles.card}>
            <div className={styles.card_image}>
              <img src={event.image} alt={event.title} />
              <div className={styles.sponsored_badge}>
                <Star size={12} fill="white" />
                Partenaire
              </div>
            </div>
            <div className={styles.card_body}>
              <div className={styles.partner_info}>
                <Badge variant="outline" size="sm">{event.partner}</Badge>
                <BadgeCheck size={16} className={styles.verified} />
              </div>
              <h3 className={styles.card_title}>{event.title}</h3>
              <div className={styles.card_info}>
                <span><MapPin size={14} /> {event.destination}</span>
                <span><Calendar size={14} /> {new Date(event.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className={styles.card_price}>{event.price}</div>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => window.open(event.link, '_blank')}
                style={{ marginTop: '1rem' }}
              >
                Réserver sur {event.partner}
                <ExternalLink size={16} style={{ marginLeft: '8px' }} />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.b2b_callout}>
        <h3>Vous êtes une association ou un coworking ?</h3>
        <p>Boostez votre visibilité auprès d'une communauté engagée de femmes voyageuses.</p>
        <Button variant="outline" onClick={() => window.location.href = 'mailto:partenariats@maghribiamsafra.com'}>Nous contacter pour un partenariat</Button>
      </div>
    </div>
  );
}
