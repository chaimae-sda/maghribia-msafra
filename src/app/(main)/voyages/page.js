'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, MapPin, Users, Clock, Star, Filter, ChevronLeft, ChevronRight, BadgeCheck, Ticket, Share2, Upload, X, Loader2, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function VoyagesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showRib, setShowRib] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('agencies'); // agencies, girls

  // Nouvel état pour vérifier si la voyageuse a déjà réservé ce voyage
  const [hasAlreadyBooked, setHasAlreadyBooked] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  // Nouveau useEffect pour vérifier la réservation existante à l'ouverture du modal
  useEffect(() => {
    async function checkExistingBooking() {
      if (!user || !selectedTrip) {
        setHasAlreadyBooked(false);
        return;
      }

      const { data } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('trip_id', selectedTrip.id)
        .single();

      if (data) {
        setHasAlreadyBooked(true);
      } else {
        setHasAlreadyBooked(false);
      }
    }

    checkExistingBooking();
  }, [user, selectedTrip]);

  async function fetchTrips() {
    const { data } = await supabase
      .from('trips')
      .select('*, profiles!trips_agency_id_fkey(full_name, avatar_url, city, social_links, role)')
      .order('date', { ascending: true });
    setTrips(data || []);
    setLoading(false);
  }

  const filteredTrips = trips.filter(t => {
    const isAgency = t.profiles?.role === 'agency';
    if (activeTab === 'agencies') return isAgency;
    return !isAgency && t.price > 0; // Voyages entre filles (cost-sharing)
  });

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🌍 Voyages & Découvertes</h1>
          <p>Organisés par des agences ou entre filles maghrébines</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('agencies')}
          className={`${styles.tab} ${activeTab === 'agencies' ? styles.tab_active : ''}`}
        >
          🏨 Agences Partenaires
        </button>
        <button
          onClick={() => setActiveTab('girls')}
          className={`${styles.tab} ${activeTab === 'girls' ? styles.tab_active : ''}`}
        >
          🎒 Voyages entre filles
        </button>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1/-1' }}><Loader2 className="spin" size={32} /></div>
        ) : filteredTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1/-1', background: '#f9f9f9', borderRadius: '16px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Aucun voyage pour le moment</h2>
            <p style={{ color: '#666' }}>Revenez plus tard pour de nouvelles aventures !</p>
          </div>
        ) : filteredTrips.map(trip => (
          <article key={trip.id} className={styles.card} onClick={() => setSelectedTrip(trip)}>
            <div className={styles.card_image}>
              <img src={trip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600'} alt={trip.title} />
              <div className={styles.card_date}>
                <span className={styles.card_day}>{new Date(trip.date).getDate()}</span>
                <span className={styles.card_month}>{monthNames[new Date(trip.date).getMonth()]}</span>
              </div>
              <Badge variant="saffron" size="sm" className={styles.card_price}>{trip.price} MAD</Badge>
            </div>
            <div className={styles.card_body}>
              <h3 className={styles.card_title}>{trip.title}</h3>
              <div className={styles.card_info}>
                <span><MapPin size={14} /> {trip.destination}</span>
              </div>
              <p className={styles.card_desc}>{trip.description?.substring(0, 80)}...</p>
              <div className={styles.card_footer}>
                <div className={styles.card_organizer}>
                  <Avatar src={trip.profiles?.avatar_url} alt={trip.profiles?.full_name} size="xs" />
                  <span>{trip.profiles?.full_name}</span>
                  {trip.profiles?.role === 'agency' && <BadgeCheck size={12} className={styles.verified} />}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {/* Trip Detail & Booking Modal */}
      {selectedTrip && (
        <div className={styles.modal_overlay} onClick={() => { setSelectedTrip(null); setShowRib(false); setBookingSuccess(false); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modal_close} onClick={() => { setSelectedTrip(null); setShowRib(false); setBookingSuccess(false); }}>
              <X size={20} />
            </button>

            <div className={styles.modal_content}>
              <div className={styles.modal_image}>
                <img src={selectedTrip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'} alt={selectedTrip.title} />
                <div className={styles.modal_badges}>
                  <Badge variant="saffron">{selectedTrip.price} MAD</Badge>
                  <Badge variant="jade">{selectedTrip.duration}</Badge>
                </div>
              </div>

              <div className={styles.modal_body}>
                <div className={styles.modal_header}>
                  <h2>{selectedTrip.title}</h2>
                  <div className={styles.modal_meta}>
                    <span><MapPin size={16} /> {selectedTrip.destination}</span>
                    <span><Calendar size={16} /> {new Date(selectedTrip.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span><Users size={16} /> {selectedTrip.max_participants} places</span>
                  </div>
                </div>

                <div className={styles.modal_organizer}>
                  <Avatar src={selectedTrip.profiles?.avatar_url} alt={selectedTrip.profiles?.full_name} size="sm" />
                  <div className={styles.organizer_info}>
                    <p className={styles.organizer_label}>Organisé par</p>
                    <p className={styles.organizer_name}>{selectedTrip.profiles?.full_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/messages?userId=${selectedTrip.agency_id || selectedTrip.user_id}&text=Bonjour, je souhaiterais avoir plus d'informations sur le voyage : ${selectedTrip.title}`)}
                  >
                    💬 Contacter
                  </Button>
                </div>

                <div className={styles.modal_description}>
                  <h3>À propos de ce voyage</h3>
                  <p>{selectedTrip.description}</p>
                </div>

                {!bookingSuccess ? (
                  <div className={styles.booking_section}>
                    {!showRib ? (
                      // Bouton mis à jour avec la vérification hasAlreadyBooked
                      <Button
                        variant={hasAlreadyBooked ? "secondary" : "primary"}
                        fullWidth
                        disabled={hasAlreadyBooked}
                        onClick={() => setShowRib(true)}
                      >
                        <Ticket size={18} /> {hasAlreadyBooked ? "Demande déjà envoyée" : "Réserver ma place"}
                      </Button>
                    ) : (
                      <div className={styles.rib_area}>
                        <div className={styles.rib_box}>
                          <p className={styles.rib_label}>RIB de l'agence pour le virement :</p>
                          <code className={styles.rib_code}>{selectedTrip.rib || selectedTrip.profiles?.social_links?.rib || 'Non renseigné'}</code>
                        </div>

                        <div className={styles.upload_area}>
                          <p className={styles.upload_label}>Uploadez votre preuve de virement :</p>
                          <label className={styles.upload_btn}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);

                                // Simulation d'upload (On utilise l'URL locale pour la démo)
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const { error } = await supabase.from('bookings').insert({
                                    user_id: user.id,
                                    trip_id: selectedTrip.id,
                                    payment_proof_url: reader.result, // En réel on uploaderait sur Storage
                                    status: 'pending'
                                  });

                                  if (!error) {
                                    setBookingSuccess(true);
                                    setHasAlreadyBooked(true); // Met à jour l'état local immédiatement
                                  } else {
                                    alert('Erreur lors de la réservation : ' + error.message);
                                  }
                                  setUploading(false);
                                };
                                reader.readAsDataURL(file);
                              }}
                              hidden
                            />
                            {uploading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
                            <span>Envoyer la preuve de paiement</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.success_msg}>
                    <CheckCircle2 size={48} color="var(--jade)" />
                    <h3>Réservation envoyée !</h3>
                    <p>L'agence vérifiera votre paiement et confirmera votre place très prochainement.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}