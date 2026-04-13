'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Compass, Home as HomeIcon, Star, BadgeCheck, Loader2, ArrowRight } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { virtualUsers } from '@/data/mock/virtualUsers';
import styles from './page.module.css';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityTrips, setPriorityTrips] = useState([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    // 1. Fetch real friend requests (notifications)
    const { data: requests } = await supabase
      .from('friendships')
      .select('*, profiles!friendships_user_id_fkey(full_name, avatar_url)')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
      
    // Format into standard notification objects
    const realNotifs = (requests || []).map(req => ({
      id: req.id,
      type: 'friend_request',
      user: req.profiles?.full_name || 'Une voyageuse',
      userId: req.user_id,
      content: 'veut devenir votre amie.',
      time: new Date(req.created_at).toLocaleDateString(),
      avatar: req.profiles?.avatar_url,
      targetUrl: `/profile/${req.user_id}`
    }));

    const welcomeNotif = { 
      id: 'welcome', 
      type: 'system', 
      user: 'Équipe Maghribia Msafra', 
      userId: 'system', 
      content: 'Bienvenue ! Remplissez votre profil pour découvrir de nouvelles amies.', 
      time: 'Récemment', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 
      targetUrl: '/profile' 
    };

    setNotifications([welcomeNotif, ...realNotifs]);

    // 2. Fetch Priority Trips (Agencies + Interests)
    const { data: trips } = await supabase
      .from('trips')
      .select('*, profiles!trips_agency_id_fkey(full_name, avatar_url, role)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (trips) {
      const interests = profile?.hobbies || [];
      const prioritized = trips.sort((a, b) => {
        // Agency trips come first
        const aIsAgency = a.profiles?.role === 'agency';
        const bIsAgency = b.profiles?.role === 'agency';
        if (aIsAgency && !bIsAgency) return -1;
        if (!aIsAgency && bIsAgency) return 1;

        // Then by interests match
        const aMatch = interests.some(i => a.description?.toLowerCase().includes(i.toLowerCase()));
        const bMatch = interests.some(i => b.description?.toLowerCase().includes(i.toLowerCase()));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;

        return 0;
      }).slice(0, 3);
      setPriorityTrips(prioritized);
    }
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔔 Notifications</h1>
        <p>Restez au courant des interactions et découvrez de nouveaux horizons</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.section}>
            <h2>Récents</h2>
            <div className={styles.notif_list}>
              {notifications.map(n => (
                <div key={n.id} className={styles.notif_card}>
                  <Link href={`/profile/${n.userId}`}>
                    <Avatar src={n.avatar} size="md" />
                  </Link>
                  <div className={styles.notif_content} onClick={() => router.push(n.targetUrl)} style={{ cursor: 'pointer', flex: 1 }}>
                    <p>
                      <Link href={`/profile/${n.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong>{n.user}</strong>
                      </Link> {n.content}
                    </p>
                    <span>{n.time}</span>
                  </div>
                  <div className={styles.notif_icon_wrap}>
                    {n.type === 'like' && <Heart size={16} fill="var(--rose)" color="var(--rose)" />}
                    {n.type === 'comment' && <MessageCircle size={16} color="var(--majorelle)" />}
                    {n.type === 'friend_request' && <UserPlus size={16} color="var(--jade)" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.priority_card}>
            <h3>🎯 Suggestion Voyages</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Sélectionné pour vous selon vos intérêts</p>
            <div className={styles.prioritized_list}>
              {priorityTrips.map(trip => (
                <div key={trip.id} className={styles.priority_item} onClick={() => router.push('/voyages')} style={{ cursor: 'pointer' }}>
                  <img src={trip.image_url} alt={trip.title} />
                  <div className={styles.priority_item_info}>
                    <h4>{trip.title}</h4>
                    <div className={styles.priority_meta}>
                      <Badge variant="verified" size="sm">Agence</Badge>
                      <span>{trip.price} MAD</span>
                    </div>
                    <Button variant="ghost" size="sm" fullWidth style={{ marginTop: '0.5rem' }}>Voir l'offre <ArrowRight size={14}/></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.housing_card} onClick={() => router.push('/hosting')} style={{ cursor: 'pointer' }}>
            <h3>🏠 Nouveaux Logements</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--jade)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <HomeIcon size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Riad à Fès disponible</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Hôte : Salma Idrissi</p>
              </div>
            </div>
          </div>

          <div className={styles.housing_card}>
            <h3>✨ Ambassadrices</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {Object.values(virtualUsers).slice(0, 2).map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => router.push(`/profile/${u.id}`)}>
                  <Avatar src={u.avatar_url} size="sm" />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.full_name}</p>
                    <Badge variant="verified" size="sm">Vérifiée</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
