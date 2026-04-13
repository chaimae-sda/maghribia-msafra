'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Star, Filter, ChevronLeft, ChevronRight, BadgeCheck, Ticket, Share2, Upload, X, Loader2, Building2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function EventsPage() {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showRib, setShowRib] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', destination: '', date: '', price: 0, description: '' });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('voyages'); // voyages, events

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    const { data } = await supabase
      .from('trips')
      .select('*, profiles!trips_agency_id_fkey(full_name, avatar_url, city, social_links)')
      .order('date', { ascending: true });
    setTrips(data || []);
    setLoading(false);
  }

  async function handleReserve() {
    setShowRib(true);
  }

  async function handleUploadProof(e) {
    const file = e.target.files[0];
    if (!file || !selectedTrip) return;

    setUploading(true);
    const fileName = `bookings/${user.id}/${selectedTrip.id}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadErr } = await supabase.storage.from('media').upload(fileName, file);

    if (uploadErr) {
      alert('Erreur lors de l\'upload: ' + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

    const { error: bookErr } = await supabase.from('bookings').insert({
      trip_id: selectedTrip.id,
      user_id: user.id,
      payment_proof_url: publicUrl,
      status: 'pending'
    });

    if (bookErr) {
      alert(bookErr.message.includes('duplicate') ? 'Vous avez déjà réservé ce voyage !' : bookErr.message);
    } else {
      setUploading(false);
      setShowRib(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedTrip(null);
      }, 3000);
    }
    setUploading(false);
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    setCreating(true);
    
    // For non-agencies creating an event
    const { error } = await supabase.from('trips').insert({
      agency_id: user.id, // we reuse agency_id column for user_id too
      title: newEvent.title,
      destination: newEvent.destination,
      date: newEvent.date,
      price: newEvent.price,
      description: newEvent.description,
      image_url: 'https://images.unsplash.com/photo-1552084110-8b436cdd75ce?w=800' // default event image
    });

    setCreating(false);
    if (!error) {
       setShowCreateEvent(false);
       fetchTrips();
    } else {
       alert('Erreur: ' + error.message);
    }
  }

  function shareTrip(trip) {
    const url = `${window.location.origin}/events?trip=${trip.id}`;
    if (navigator.share) {
      navigator.share({ title: trip.title, text: `Découvrez ce voyage : ${trip.title}`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papiers !');
    }
  }

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  // If no real trips, show placeholder
  const hasTrips = trips.length > 0;

  const filteredTrips = trips.filter(t => {
    // If it's an agency and has a price, it's a voyage. Otherwise it's an event.
    // We can also check a 'category' field if we add it. 
    // For now: Agencies = Voyages, Travelers = Events
    const isAgency = t.profiles?.role === 'agency';
    if (activeTab === 'voyages') return isAgency && t.price > 0;
    return !isAgency || t.price === 0;
  });

  return (
    <div className={styles.events}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📅 Voyages & Événements</h1>
          <p>Explorer le Maroc avec la communauté</p>
        </div>
        {user && (
          <Button variant="primary" onClick={() => setShowCreateEvent(true)}>
            + Créer {profile?.role === 'agency' ? 'un voyage' : 'une sortie'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.categories} style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('voyages')} 
          className={`${styles.category} ${activeTab === 'voyages' ? styles.category_active : ''}`}
        >
          🌍 Voyages Organisés
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          className={`${styles.category} ${activeTab === 'events' ? styles.category_active : ''}`}
        >
          🎉 Sorties & Rencontres
        </button>
      </div>

      <div className={styles.eventsLayout}>
        <div className={styles.eventsMain}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} /></div>
          )}

          {!loading && filteredTrips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f9f9f9', borderRadius: '16px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍃</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Aucun {activeTab === 'voyages' ? 'voyage' : 'événement'} pour le moment</h2>
              <p style={{ color: '#666' }}>Soyez la première à en proposer un !</p>
            </div>
          )}

          <div className={styles.eventGrid}>
            {filteredTrips.map(trip => (
              <article key={trip.id} className={styles.eventCard} onClick={() => { setSelectedTrip(trip); setShowRib(false); setBookingSuccess(false); }}>
                <div className={styles.eventCard_image}>
                  <img src={trip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600'} alt={trip.title} />
                  <div className={styles.eventCard_date}>
                    <span className={styles.eventCard_day}>{new Date(trip.date).getDate()}</span>
                    <span className={styles.eventCard_month}>{monthNames[new Date(trip.date).getMonth()]}</span>
                  </div>
                  <Badge variant="saffron" size="sm" className={styles.eventCard_price}>{trip.price} MAD</Badge>
                </div>
                <div className={styles.eventCard_body}>
                  <h3 className={styles.eventCard_title}>{trip.title}</h3>
                  <div className={styles.eventCard_info}>
                    <span><MapPin size={14} /> {trip.destination}</span>
                    {trip.duration && <span><Clock size={14} /> {trip.duration}</span>}
                  </div>
                  <p className={styles.eventCard_desc}>{trip.description?.substring(0, 100)}...</p>
                  <div className={styles.eventCard_footer}>
                    <div className={styles.eventCard_organizer}>
                      <Avatar src={trip.profiles?.avatar_url} alt={trip.profiles?.full_name} size="xs" />
                      <span>{trip.profiles?.full_name}</span>
                      <BadgeCheck size={12} className={styles.verified} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); shareTrip(trip); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--majorelle)' }}>
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className={styles.modal_overlay} onClick={() => setSelectedTrip(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <img src={selectedTrip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'} alt={selectedTrip.title} className={styles.modal_image} />
            <div className={styles.modal_body}>
              <h2>{selectedTrip.title}</h2>
              <div className={styles.modal_meta}>
                <span><MapPin size={16} /> {selectedTrip.destination}</span>
                <span><Calendar size={16} /> {new Date(selectedTrip.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {selectedTrip.duration && <span><Clock size={16} /> {selectedTrip.duration}</span>}
                {selectedTrip.max_participants && <span><Users size={16} /> Max {selectedTrip.max_participants} participantes</span>}
              </div>
              <p style={{ lineHeight: '1.7' }}>{selectedTrip.description}</p>

              <div className={styles.modal_organizer}>
                <Avatar src={selectedTrip.profiles?.avatar_url} alt={selectedTrip.profiles?.full_name} size="md" />
                <div>
                  <strong>Organisée par {selectedTrip.profiles?.full_name}</strong>
                  <Badge variant="verified" size="sm">✓ Agence Vérifiée</Badge>
                </div>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--majorelle)', margin: '1rem 0' }}>
                {selectedTrip.price} MAD
              </div>

              {bookingSuccess ? (
                <div style={{ background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.3)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <h3 style={{ color: 'var(--jade)' }}>Réservation envoyée !</h3>
                  <p style={{ color: '#666' }}>L'agence va vérifier votre preuve de paiement et confirmer votre réservation.</p>
                </div>
              ) : !showRib ? (
                <div className={styles.modal_actions}>
                  {selectedTrip.price > 0 ? (
                    <Button variant="primary" size="lg" fullWidth onClick={handleReserve}>
                      <Ticket size={18} />
                      Réserver ce voyage — {selectedTrip.price} MAD
                    </Button>
                  ) : (
                    <Button variant="primary" size="lg" fullWidth onClick={() => alert('Vous avez rejoint cet événement ! Nous vous enverrons les détails par message.')}>
                      <Check size={18} />
                      Rejoindre gratuitement
                    </Button>
                  )}
                  <Button variant="ghost" fullWidth onClick={() => shareTrip(selectedTrip)}>
                    <Share2 size={18} /> Partager avec mes amies
                  </Button>
                  <Button variant="ghost" fullWidth onClick={() => setSelectedTrip(null)}>Fermer</Button>
                </div>
              ) : (
                <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '1rem' }}>💳 Informations de paiement</h3>
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>Effectuez un virement de <strong>{selectedTrip.price} MAD</strong> au RIB suivant :</p>
                  <div style={{ background: '#fff', border: '2px dashed var(--majorelle)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '1px', margin: '1rem 0' }}>
                    {selectedTrip.rib || selectedTrip.profiles?.social_links?.rib || 'RIB non disponible'}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Après avoir effectué le virement, uploadez la preuve de paiement (photo du reçu) ci-dessous :
                  </p>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '2rem', border: '2px dashed #ccc', borderRadius: '12px', cursor: 'pointer',
                    background: '#fff', transition: 'border-color 0.2s'
                  }}>
                    {uploading ? (
                      <><Loader2 className="spin" size={24} /><span>Envoi en cours...</span></>
                    ) : (
                      <><Upload size={24} style={{ color: 'var(--majorelle)' }} /><span style={{ fontWeight: 600 }}>Cliquez pour uploader votre reçu</span><span style={{ fontSize: '0.85rem', color: '#999' }}>JPG, PNG ou PDF</span></>
                    )}
                    <input type="file" accept="image/*,.pdf" onChange={handleUploadProof} hidden disabled={uploading} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className={styles.modal_overlay} onClick={() => setShowCreateEvent(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Organiser un événement</h2>
              <button onClick={() => setShowCreateEvent(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Titre de l'événement</label>
                <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Destination</label>
                  <input type="text" required value={newEvent.destination} onChange={e => setNewEvent({...newEvent, destination: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Date</label>
                  <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Prix (MAD) - 0 si gratuit</label>
                <input type="number" required value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Description</label>
                <textarea required rows={4} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }} />
              </div>
              <Button variant="primary" type="submit" disabled={creating} fullWidth>
                {creating ? <Loader2 size={18} className="spin" /> : 'Publier l\'événement'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
