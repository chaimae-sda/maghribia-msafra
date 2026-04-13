'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, X, Eye, Calendar, MapPin, Users, Loader2, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';

export default function AgencyDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('trips');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tripForm, setTripForm] = useState({ title: '', description: '', destination: '', date: '', duration: '', price: '', max_participants: 20, image_url: '' });
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'agency')) {
      router.push('/feed');
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (user && profile?.role === 'agency') {
      fetchTrips();
      fetchBookings();
    }
  }, [user, profile]);

  async function fetchTrips() {
    setLoading(true);
    const { data } = await supabase.from('trips').select('*').eq('agency_id', user.id).order('created_at', { ascending: false });
    setTrips(data || []);
    setLoading(false);
  }

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*, trips!bookings_trip_id_fkey(title, price), profiles!bookings_user_id_fkey(full_name, avatar_url, email, city)')
      .in('trip_id', trips.map(t => t.id).length > 0 ? trips.map(t => t.id) : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at', { ascending: false });
    setBookings(data || []);
  }

  // Refetch bookings whenever trips change
  useEffect(() => {
    if (trips.length > 0) fetchBookings();
  }, [trips]);

  async function handleCreateTrip(e) {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from('trips').insert({
      agency_id: user.id,
      ...tripForm,
      price: parseFloat(tripForm.price),
      max_participants: parseInt(tripForm.max_participants),
      rib: profile?.social_links?.rib || ''
    });
    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      setShowCreate(false);
      setTripForm({ title: '', description: '', destination: '', date: '', duration: '', price: '', max_participants: 20, image_url: '' });
      fetchTrips();
    }
    setCreating(false);
  }

  async function handleBookingAction(bookingId, action) {
    await supabase.from('bookings').update({ status: action }).eq('id', bookingId);
    fetchBookings();
  }

  if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>;
  if (!user || profile?.role !== 'agency') return null;

  if (!profile?.is_approved) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
        <h2>En attente d'approbation</h2>
        <p style={{ color: '#666' }}>Votre agence est en cours de vérification. Vous pourrez créer des voyages une fois approuvée par l'administration.</p>
      </div>
    );
  }

  const tabStyle = (t) => ({
    padding: '0.6rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    background: tab === t ? 'var(--majorelle)' : '#f0f0f0',
    color: tab === t ? '#fff' : '#666'
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>🏢 Dashboard Agence</h1>
          <p style={{ margin: 0, color: '#666' }}>{profile?.full_name}</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Nouveau Voyage
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button style={tabStyle('trips')} onClick={() => setTab('trips')}>✈️ Mes Voyages ({trips.length})</button>
        <button style={tabStyle('bookings')} onClick={() => setTab('bookings')}>📋 Réservations ({bookings.length})</button>
      </div>

      {tab === 'trips' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spin" /></div>}
          {!loading && trips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
              <h3>Aucun voyage créé</h3>
              <p style={{ color: '#666' }}>Cliquez sur "Nouveau Voyage" pour publier votre première offre.</p>
            </div>
          )}
          {trips.map(trip => (
            <div key={trip.id} style={{ display: 'flex', gap: '1rem', background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <img src={trip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=200'} alt={trip.title}
                style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '12px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.3rem' }}>{trip.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.5rem' }}>
                  <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {trip.destination} · <Calendar size={12} style={{ verticalAlign: 'middle' }} /> {new Date(trip.date).toLocaleDateString('fr-FR')} · {trip.price} MAD
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>Aucune réservation</h3>
            </div>
          )}
          {bookings.map(b => (
            <div key={b.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Avatar src={b.profiles?.avatar_url} alt={b.profiles?.full_name} size="md" />
                  <div>
                    <strong>{b.profiles?.full_name}</strong>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#666' }}>{b.profiles?.email}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Voyage : {b.trips?.title} — {b.trips?.price} MAD</p>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#999' }}>{new Date(b.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                    background: b.status === 'confirmed' ? 'rgba(42,157,143,0.1)' : b.status === 'rejected' ? 'rgba(231,76,60,0.1)' : 'rgba(233,196,106,0.2)',
                    color: b.status === 'confirmed' ? 'var(--jade)' : b.status === 'rejected' ? '#e74c3c' : '#b8860b'
                  }}>
                    {b.status === 'confirmed' ? '✅ Confirmé' : b.status === 'rejected' ? '❌ Refusé' : '⏳ En attente'}
                  </span>
                  {b.payment_proof_url && (
                    <button onClick={() => setSelectedProof(b.payment_proof_url)} style={{ background: 'var(--majorelle)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> Voir le reçu
                    </button>
                  )}
                </div>
              </div>
              {b.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                  <button onClick={() => handleBookingAction(b.id, 'confirmed')} style={{ flex: 1, background: 'var(--jade)', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Check size={16} /> Confirmer le paiement
                  </button>
                  <button onClick={() => handleBookingAction(b.id, 'rejected')} style={{ flex: 1, background: '#f0f0f0', color: '#333', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    <X size={16} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setShowCreate(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>✈️ Créer un voyage</h2>
            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Titre du voyage *" value={tripForm.title} onChange={e => setTripForm({...tripForm, title: e.target.value})} required
                style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
              <input type="text" placeholder="Destination *" value={tripForm.destination} onChange={e => setTripForm({...tripForm, destination: e.target.value})} required
                style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
              <textarea placeholder="Description du voyage *" value={tripForm.description} onChange={e => setTripForm({...tripForm, description: e.target.value})} rows={3} required
                style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input type="date" value={tripForm.date} onChange={e => setTripForm({...tripForm, date: e.target.value})} required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
                <input type="text" placeholder="Durée (ex: 3 jours)" value={tripForm.duration} onChange={e => setTripForm({...tripForm, duration: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input type="number" placeholder="Prix (MAD) *" value={tripForm.price} onChange={e => setTripForm({...tripForm, price: e.target.value})} required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
                <input type="number" placeholder="Max participants" value={tripForm.max_participants} onChange={e => setTripForm({...tripForm, max_participants: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
              </div>
              <input type="url" placeholder="URL de l'image (optionnel)" value={tripForm.image_url} onChange={e => setTripForm({...tripForm, image_url: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)} fullWidth>Annuler</Button>
                <Button variant="primary" type="submit" disabled={creating} fullWidth>
                  {creating ? <><Loader2 size={16} className="spin" /> Création...</> : 'Publier le voyage'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Viewer */}
      {selectedProof && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setSelectedProof(null)}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <button onClick={() => setSelectedProof(null)} style={{ position: 'absolute', top: '-40px', right: 0, background: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
            <img src={selectedProof} alt="Preuve de paiement" style={{ width: '100%', borderRadius: '16px' }} />
          </div>
        </div>
      )}
    </div>
  );
}
