'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Loader2, Share2, Map, Camera, Coffee, Palmtree } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function SortiesPage() {
  const { user } = useAuth();
  const [sorties, setSorties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSorties();
  }, []);

  async function fetchSorties() {
    // Only free community outings
    const { data } = await supabase
      .from('trips')
      .select('*, profiles!trips_agency_id_fkey(full_name, avatar_url, city, role)')
      .eq('price', 0)
      .order('date', { ascending: true });
    setSorties(data?.filter(t => t.profiles?.role !== 'agency') || []);
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🎉 Sorties entre Filles</h1>
          <p>Rencontres gratuites, balades et moments de partage entre voyageuses</p>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1/-1' }}><Loader2 className="spin" size={32} /></div>
        ) : sorties.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💬</div>
            <h2>Pas encore de sorties prévues</h2>
            <p>Soyez la première à proposer une activité dans votre ville !</p>
            <Button variant="primary" style={{ marginTop: '1.5rem' }}>+ Proposer une sortie</Button>
          </div>
        ) : sorties.map(sortie => (
          <article key={sortie.id} className={styles.card}>
            <div className={styles.card_image}>
              <img src={sortie.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600'} alt={sortie.title} />
              <Badge variant="jade" size="sm" className={styles.card_tag}>Gratuit</Badge>
            </div>
            <div className={styles.card_body}>
              <h3 className={styles.card_title}>{sortie.title}</h3>
              <div className={styles.card_info}>
                <span><MapPin size={14} /> {sortie.destination}</span>
                <span><Calendar size={14} /> {new Date(sortie.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className={styles.card_desc}>{sortie.description}</p>
              <div className={styles.card_organizer}>
                <Avatar src={sortie.profiles?.avatar_url} alt={sortie.profiles?.full_name} size="xs" />
                <span>Organisée par {sortie.profiles?.full_name}</span>
              </div>
              <Button variant="outline" fullWidth size="sm" style={{ marginTop: '1rem' }}>Rejoindre le groupe</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
