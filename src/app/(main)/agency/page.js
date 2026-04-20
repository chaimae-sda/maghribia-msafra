'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plane, Calendar as CalendarIcon, Users,
  FileText, Globe, MessageSquare, Plus, Loader2, TrendingUp,
  DollarSign, Download, CheckCircle2, MapPin, Edit3, Trash2,
  Calendar, Lock, Unlock, UploadCloud, Eye, Check, X, LogOut, Settings, ExternalLink, Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MessagingCenter from '@/components/messaging/MessagingCenter';

export default function AgencyDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('kpis');
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [tripForm, setTripForm] = useState({ title: '', description: '', destination: '', date: '', duration: '', price: '', max_participants: 20, image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);
  const [marketTrips, setMarketTrips] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', city: '', bio: '', phone: '', rib: '', avatar_url: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [platformPayments, setPlatformPayments] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'agency')) {
      router.push('/feed');
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (user && profile?.role === 'agency') {
      fetchTrips();
      fetchMarketTrips();
      fetchPlatformPayments();
      setProfileForm({
        full_name: profile.full_name || '',
        city: profile.city || '',
        bio: profile.bio || '',
        phone: profile.social_links?.phone || '',
        rib: profile.social_links?.rib || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [user, profile]);

  async function fetchPlatformPayments() {
    const { data } = await supabase.from('agency_platform_payments').select('*').eq('agency_id', user.id).order('created_at', { ascending: false });
    setPlatformPayments(data || []);
  }

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

  async function fetchMarketTrips() {
    const { data } = await supabase
      .from('trips')
      .select('*, profiles(full_name, avatar_url)')
      .neq('agency_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setMarketTrips(data || []);
  }

  useEffect(() => {
    if (trips.length > 0) fetchBookings();
  }, [trips]);

  // --- ACTIONS VOYAGES ---
  const openCreateModal = () => {
    setTripForm({ title: '', description: '', destination: '', date: '', duration: '', price: '', max_participants: 20, image_url: '' });
    setImageFile(null);
    setEditingTripId(null);
    setShowModal(true);
  };

  const openEditModal = (trip) => {
    setTripForm({
      title: trip.title || '', description: trip.description || '', destination: trip.destination || '',
      date: trip.date || '', duration: trip.duration || '', price: trip.price || '',
      max_participants: trip.max_participants || 20, image_url: trip.image_url || ''
    });
    setImageFile(null);
    setEditingTripId(trip.id);
    setShowModal(true);
  };

  async function handleSaveTrip(e) {
    e.preventDefault();
    setSaving(true);
    let finalImageUrl = tripForm.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `trips/${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, imageFile);
      if (uploadError) {
        alert("Erreur lors de l'upload de l'image: " + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    }

    const payload = {
      agency_id: user.id, title: tripForm.title, description: tripForm.description, destination: tripForm.destination,
      date: tripForm.date, duration: tripForm.duration, price: parseFloat(tripForm.price),
      max_participants: parseInt(tripForm.max_participants), image_url: finalImageUrl, rib: profile?.social_links?.rib || ''
    };

    if (editingTripId) {
      await supabase.from('trips').update(payload).eq('id', editingTripId);
    } else {
      payload.is_full = false;
      await supabase.from('trips').insert(payload);
    }

    setShowModal(false);
    setEditingTripId(null);
    setImageFile(null);
    fetchTrips();
    setSaving(false);
  }

  async function handleToggleFullStatus(tripId, currentStatus) {
    await supabase.from('trips').update({ is_full: !currentStatus }).eq('id', tripId);
    fetchTrips();
  }

  async function handleDeleteTrip(tripId) {
    await supabase.from('trips').delete().eq('id', tripId);
    setTrips(prev => prev.filter(t => t.id !== tripId));
  }

  async function handleBookingAction(bookingId, action) {
    await supabase.from('bookings').update({ status: action }).eq('id', bookingId);

    if (action === 'confirmed') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const welcomeMessage = `Félicitations ${booking.profiles?.full_name.split(' ')[0]} ! 🎉 Votre réservation pour "${booking.trips?.title}" est confirmée. Vous faites maintenant partie du groupe de voyage ! Préparez-vous pour l'aventure. 🧳✨`;
        await supabase.from('messages').insert({ sender_id: user.id, receiver_id: booking.user_id, content: welcomeMessage, status: 'sent' });
      }
    }
    fetchBookings();
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSaving(true);

    let finalAvatarUrl = profileForm.avatar_url;

    if (logoFile) {
      const fileName = `logos/${user.id}-${Date.now()}.${logoFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, logoFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }
    }

    const { error } = await updateProfile({
      full_name: profileForm.full_name,
      city: profileForm.city,
      bio: profileForm.bio,
      avatar_url: finalAvatarUrl,
      social_links: { ...profile.social_links, phone: profileForm.phone, rib: profileForm.rib }
    });

    if (!error) {
      await fetchProfile(user.id);
      setShowProfileModal(false);
      setLogoFile(null);
      alert("Profil mis à jour !");
    }
    setSaving(false);
  }

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error("Erreur déconnexion:", err);
      window.location.href = '/';
    }
  };

  async function handleUploadReceipt(e) {
    if (!receiptFile) return;
    setUploadingReceipt(true);
    const fileName = `receipts/${user.id}/${Date.now()}.${receiptFile.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, receiptFile);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      await supabase.from('agency_platform_payments').insert({
        agency_id: user.id,
        amount: 450.00,
        month: new Date().toISOString().slice(0, 7),
        proof_url: publicUrl,
        status: 'pending'
      });
      await fetchPlatformPayments();
      await fetchProfile(user.id);
      setReceiptFile(null);
      alert("Votre reçu a été soumis avec succès ! L'administration le validera bientôt.");
    }
    setUploadingReceipt(false);
  }

  const generateInvoicePDF = async (month, amount, status) => {
    const doc = new jsPDF();

    const loadLogo = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = '/logo.png';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    };

    const logo = await loadLogo();

    const primaryColor = [33, 37, 41];
    const accentColor = [96, 98, 255];
    const mutedColor = [108, 117, 125];
    const redColor = [220, 53, 69];
    const greenColor = [42, 157, 143];

    if (logo) {
      doc.addImage(logo, 'PNG', 20, 15, 12, 12);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text('Maghribia Msafra', logo ? 35 : 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    doc.text('Voyage 100% Féminin', logo ? 35 : 20, 32);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(...primaryColor);
    doc.text('FACTURE', 190, 30, { align: 'right' });

    doc.setFontSize(14);
    doc.text(`MM-${new Date().getFullYear()}-00${platformPayments.indexOf(platformPayments.find(p => p.month === month)) + 1 || '1'}`, 190, 42, { align: 'right' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 120, 60);
    doc.text('Statut:', 120, 68);

    doc.setFont('helvetica', 'normal');
    const displayMonth = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    doc.text(displayMonth.charAt(0).toUpperCase() + displayMonth.slice(1), 190, 60, { align: 'right' });

    if (status === 'approved') {
      doc.setTextColor(...greenColor);
      doc.text('PAYÉ', 190, 68, { align: 'right' });
    } else {
      doc.setTextColor(...redColor);
      doc.text('NON PAYÉ', 190, 68, { align: 'right' });
    }

    doc.setDrawColor(230);
    doc.line(20, 80, 190, 80);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mutedColor);
    doc.text('FACTURÉ À', 20, 95);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(profile?.full_name || 'Agence Partenaire', 20, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(profile?.city || '', 20, 112);

    const tableY = 130;
    doc.setFillColor(248, 249, 250);
    doc.rect(20, tableY, 170, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text('Description', 25, tableY + 8);
    doc.text('Qté', 110, tableY + 8);
    doc.text('Prix Unitaire', 140, tableY + 8);
    doc.text('Total', 175, tableY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    const rowY = tableY + 25;
    doc.text(`Abonnement Plateforme — ${displayMonth}`, 25, rowY);
    doc.text('1', 112, rowY);
    doc.text(`${amount}.00 MAD`, 140, rowY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${amount}.00 MAD`, 175, rowY);

    doc.setDrawColor(240);
    doc.line(20, rowY + 10, 190, rowY + 10);

    const summaryY = rowY + 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...mutedColor);
    doc.text('Sous-total', 130, summaryY);
    doc.text('Commission (0%)', 130, summaryY + 10);

    doc.setTextColor(...primaryColor);
    doc.text(`${amount}.00 MAD`, 190, summaryY, { align: 'right' });
    doc.text('0.00 MAD', 190, summaryY + 10, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.line(110, summaryY + 18, 190, summaryY + 18);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Montant Total', 130, summaryY + 30);
    doc.text(`${amount}.00 MAD`, 190, summaryY + 30, { align: 'right' });

    doc.save(`Facture_${profile?.full_name.replace(/\s+/g, '_')}_${month}.pdf`);
  };

  const KPIDashboard = () => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const totalBrut = confirmedBookings.reduce((sum, b) => sum + (b.trips?.price || 0), 0);
    const platformFee = totalBrut * 0.1;
    const netRevenue = totalBrut - platformFee;

    return (
      <div className="tab-content fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>📊 Vue d'ensemble (Mois en cours)</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Revenu Brut</span><DollarSign size={16} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalBrut.toLocaleString()} MAD</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--jade)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
              <TrendingUp size={14} /> Réel (Confirmés)
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Frais Plateforme (10%)</span><Globe size={16} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--rose)' }}>-{platformFee.toLocaleString()} MAD</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>À régler mensuellement</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', borderLeft: '4px solid var(--majorelle)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Revenu Net</span><DollarSign size={16} color="var(--majorelle)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--majorelle)' }}>{netRevenue.toLocaleString()} MAD</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Bénéfice estimé</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Réservations Confirmées</span><Users size={16} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{confirmedBookings.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sur {bookings.length} demandes</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Dernières réservations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {confirmedBookings.slice(0, 5).map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Avatar src={b.profiles?.avatar_url} size="sm" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.profiles?.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.trips?.title}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--jade)' }}>+{b.trips?.price} MAD</div>
              </div>
            ))}
            {confirmedBookings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune réservation confirmée pour le moment.</p>}
          </div>
        </div>
      </div>
    );
  };

  const InvoicesTab = () => {
    const startDate = new Date(profile?.created_at || Date.now());
    const endDate = new Date();
    const months = [];

    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      months.push(current.toISOString().slice(0, 7));
      current.setMonth(current.getMonth() + 1);
    }
    months.reverse();

    const unpaidMonths = months.filter(m => {
      const p = platformPayments.find(pay => pay.month === m);
      return !p || p.status !== 'approved';
    });

    const paidPayments = platformPayments.filter(p => p.status === 'approved');

    return (
      <div className="tab-content fade-in">
        {/* Centered grid layout with balanced columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start', width: '100%' }}>

          <div style={{ width: '100%' }}>
            {/* SECTION 1: FACTURES À RÉGLER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.6rem' }}>📑</div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Factures à régler</h2>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Mois</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Montant</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Statut</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-primary)' }}>
                  {unpaidMonths.map(m => {
                    const payment = platformPayments.find(p => p.month === m);
                    const status = payment?.status || 'unpaid';

                    return (
                      <tr key={m} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>450 MAD</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {status === 'pending' ? (
                            <Badge variant="warning">En cours</Badge>
                          ) : (
                            <Badge variant="rose">Non payé</Badge>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button
                            onClick={() => generateInvoicePDF(m, 450, status)}
                            style={{ background: 'none', border: 'none', color: 'var(--majorelle)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', transition: 'opacity 0.2s', padding: '0.4rem 0.8rem' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECTION 2: HISTORIQUE DES PAIEMENTS */}
            {paidPayments.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '1.6rem' }}>✅</div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Historique des paiements</h2>
                </div>
                <div style={{ background: 'rgba(42,157,143,0.02)', borderRadius: '16px', border: '1px solid rgba(42,157,143,0.15)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(42,157,143,0.08)', color: 'var(--jade)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <tr>
                        <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Mois</th>
                        <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Montant</th>
                        <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>Statut</th>
                        <th style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-primary)' }}>
                      {paidPayments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(42,157,143,0.1)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(42,157,143,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.month}</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.amount} MAD</td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <Badge variant="jade">Payé</Badge>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button
                              onClick={() => generateInvoicePDF(p.month, p.amount, 'approved')}
                              style={{ background: 'none', border: 'none', color: 'var(--majorelle)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', transition: 'opacity 0.2s', padding: '0.4rem 0.8rem' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                              Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'sticky', top: '2rem', height: 'fit-content' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <DollarSign size={22} color="var(--majorelle)" /> Régler mon abonnement
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Effectuez un virement de <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>450 MAD</span> vers le RIB de la plateforme.
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>RIB Plateforme</div>
              <div style={{ fontSize: '0.95rem', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '1px' }}>
                007 123 4567890123 45
              </div>
            </div>

            <div style={{ border: '2px dashed var(--border-light)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', position: 'relative', background: 'var(--bg-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--majorelle)';
                e.currentTarget.style.background = 'rgba(102, 51, 153, 0.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.background = 'var(--bg-primary)';
              }}>
              <input type="file" onChange={e => setReceiptFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', borderRadius: '12px' }} />
              <UploadCloud size={32} color="var(--majorelle)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {receiptFile ? receiptFile.name : 'Télécharger le reçu'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF ou image recommandé</div>
            </div>

            <Button
              variant="primary"
              fullWidth
              style={{ marginTop: '1.5rem', height: '44px', fontSize: '0.95rem', fontWeight: 600 }}
              onClick={handleUploadReceipt}
              disabled={uploadingReceipt || !receiptFile}
            >
              {uploadingReceipt ? <Loader2 className="spin" size={18} /> : 'Soumettre le paiement'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ComingSoonTab = ({ title, icon }) => (
    <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Cette section sera bientôt disponible pour gérer vos événements.</p>
    </div>
  );

  const MarketExplorerTab = () => (
    <div className="tab-content fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>🌍 Explorer le marché</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Découvrez ce que les autres agences proposent en ce moment.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {marketTrips.map(trip => (
          <div key={trip.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <img src={trip.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'} alt={trip.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Avatar src={trip.profiles?.avatar_url} size="xs" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{trip.profiles?.full_name}</span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{trip.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--majorelle)', fontWeight: 600 }}>{trip.price} MAD</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.destination}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>;
  if (!user || profile?.role !== 'agency') return null;

  if (!profile?.is_approved) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
        <h2>En attente d'approbation</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Votre agence est en cours de vérification. Vous pourrez créer des voyages une fois approuvée par l'administration.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Forced CSS Overrides to clear global layout conflicts */}
      <style dangerouslySetInnerHTML={{
        __html: `
        header, nav:not(.agency-sidebar-nav), .bottom-nav { display: none !important; }
        .main { padding: 0 !important; max-width: none !important; margin: 0 !important; }
        #root, .layout_layout__67u5G { overflow: hidden; } /* Prevent global scroll interference */
      ` }} />

      {/* --- SIDEBAR VERTICALE --- */}
      <aside style={{
        width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column', height: 'auto', alignSelf: 'stretch', padding: '1.5rem 0',
        zIndex: 50, position: 'relative', flexShrink: 0
      }}>
        <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3rem)' }}>
          <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <img src="/logo.png" alt="Maghribia Msafra" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>MAGHRIBIA<br />MSAFRA</span>
            </div>

            <div
              onClick={() => setShowProfileModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'filter 0.2s' }}
              onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.95)'}
              onMouseOut={e => e.currentTarget.style.filter = 'none'}
            >
              <Avatar src={profile?.avatar_url} size="md" />
              <div style={{ overflow: 'hidden' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{profile?.full_name}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--majorelle)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Settings size={10} /> Modifier
                </span>
              </div>
            </div>
          </div>

          <nav className="agency-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem', flex: 1, overflowY: 'auto' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, padding: '0 0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Performance</p>
            <NavItem icon={<LayoutDashboard size={18} />} label="KPIs & Revenus" active={activeTab === 'kpis'} onClick={() => setActiveTab('kpis')} />
            <NavItem icon={<FileText size={18} />} label="Factures" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />

            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, padding: '0 0.5rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Gestion</p>
            <NavItem icon={<Users size={18} />} label="Réservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
            <NavItem icon={<Plane size={18} />} label="Mes Voyages" active={activeTab === 'trips'} onClick={() => setActiveTab('trips')} />
            <NavItem icon={<CalendarIcon size={18} />} label="Mes Événements" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />

            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, padding: '0 0.5rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Réseau</p>
            <NavItem icon={<Globe size={18} />} label="Explorer le marché" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
            <NavItem icon={<MessageSquare size={18} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />

            <div style={{ marginTop: 'auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
              <NavItem icon={<LogOut size={18} />} label="Se déconnecter" active={false} onClick={handleLogout} />
            </div>
          </nav>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      {/* LA DEUXIÈME CORRECTION EST ICI : Flex 1 sans justify-content flex, et max-width beaucoup plus grand (1400px) */}
      <main style={{ flex: 1, padding: '2.5rem 4rem', overflowY: 'auto', zIndex: 40, position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Bonjour {profile?.full_name.split(' ')[0]}, ravie de vous revoir ! ☀️</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Voici un aperçu de l'activité de votre agence aujourd'hui.</p>
          </header>

          {activeTab === 'kpis' && <KPIDashboard />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'explore' && <MarketExplorerTab />}
          {activeTab === 'messages' && (
            <div className="tab-content fade-in" style={{ height: 'calc(100vh - 4rem)' }}>
              <MessagingCenter isAgency={true} compact={false} />
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="tab-content fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>✈️ Gestion de mes voyages</h2>
                <Button variant="primary" onClick={openCreateModal}><Plus size={16} /> Nouveau Voyage</Button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spin" color="var(--text-primary)" /></div>}

                {!loading && trips.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Aucun voyage créé</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Cliquez sur "Nouveau Voyage" pour publier votre première offre.</p>
                  </div>
                )}

                {trips.map(trip => {
                  const tripBookings = bookings.filter(b => b.trip_id === trip.id);
                  const confirmedCount = tripBookings.filter(b => b.status === 'confirmed').length;
                  const isPast = new Date(trip.date) < new Date();
                  const canDelete = isPast || confirmedCount === 0;

                  return (
                    <div key={trip.id} style={{ display: 'flex', gap: '1rem', background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', flexWrap: 'wrap', position: 'relative' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={trip.image_url || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=200'} alt={trip.title}
                          style={{ width: '130px', height: '100px', objectFit: 'cover', borderRadius: '12px', opacity: isPast ? 0.6 : 1 }} />

                        {isPast ? (
                          <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge variant="default" size="sm">Terminé</Badge></div>
                        ) : trip.is_full ? (
                          <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge variant="rose" size="sm">Complet</Badge></div>
                        ) : (
                          <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge variant="jade" size="sm">En cours</Badge></div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <h3 style={{ margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>{trip.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                          <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {trip.destination} · <Calendar size={12} style={{ verticalAlign: 'middle' }} /> {new Date(trip.date).toLocaleDateString('fr-FR')} · {trip.price} MAD
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          <Users size={12} style={{ verticalAlign: 'middle' }} /> {confirmedCount} / {trip.max_participants} confirmés
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'flex-end', minWidth: '160px' }}>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(trip)} style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', width: '100%' }}>
                          <Edit3 size={14} /> Modifier
                        </Button>

                        {!isPast && (
                          <Button
                            variant={trip.is_full ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleFullStatus(trip.id, trip.is_full)}
                            style={{ width: '100%', borderColor: trip.is_full ? 'var(--jade)' : 'transparent', color: trip.is_full ? 'var(--jade)' : 'var(--text-primary)' }}
                          >
                            {trip.is_full ? <><Unlock size={14} /> Rouvrir</> : <><Lock size={14} /> Complet</>}
                          </Button>
                        )}

                        <div style={{ width: '100%' }} title={!canDelete ? "Impossible de supprimer : des réservations sont confirmées pour ce voyage à venir." : "Supprimer ce voyage"}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => canDelete && handleDeleteTrip(trip.id)}
                            disabled={!canDelete}
                            style={{ width: '100%', color: canDelete ? 'var(--rose)' : 'var(--text-muted)', opacity: canDelete ? 1 : 0.5 }}
                          >
                            <Trash2 size={14} /> Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="tab-content fade-in">
              <h2 style={{ marginBottom: '2rem' }}>📋 Gestion des Réservations</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ color: 'var(--text-primary)' }}>Aucune réservation</h3>
                  </div>
                )}
                {bookings.map(b => (
                  <div key={b.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Avatar src={b.profiles?.avatar_url} alt={b.profiles?.full_name} size="md" />
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{b.profiles?.full_name}</strong>
                          <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.profiles?.email}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Voyage : <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.trips?.title}</span> — {b.trips?.price} MAD</p>
                          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Le {new Date(b.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                          background: b.status === 'confirmed' ? 'rgba(42,157,143,0.1)' : b.status === 'rejected' ? 'rgba(231,76,60,0.1)' : 'rgba(233,196,106,0.2)',
                          color: b.status === 'confirmed' ? 'var(--jade)' : b.status === 'rejected' ? 'var(--rose)' : '#b8860b'
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
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                        <button onClick={() => handleBookingAction(b.id, 'confirmed')} style={{ flex: 1, background: 'var(--jade)', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Check size={16} /> Confirmer le paiement
                        </button>
                        <button onClick={() => handleBookingAction(b.id, 'rejected')} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                          <X size={16} /> Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && <ComingSoonTab title="Mes Événements (Bientôt)" icon="🎉" />}
          {activeTab === 'explore' && <ComingSoonTab title="Veille Concurrentielle" icon="🌍" />}

        </div>
      </main>

      {/* --- MODALS --- */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-light)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {editingTripId ? '✏️ Modifier le voyage' : '✈️ Créer un voyage'}
            </h2>
            <form onSubmit={handleSaveTrip} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Titre de l'événement *</label>
                <input type="text" placeholder="Ex: Escape Saharienne à Merzouga" value={tripForm.title} onChange={e => setTripForm({ ...tripForm, title: e.target.value })} required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Lieu / Destination *</label>
                <input type="text" placeholder="Ex: Merzouga, Maroc" value={tripForm.destination} onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Programme détaillé *</label>
                <textarea placeholder="Décrivez le déroulement du voyage..." value={tripForm.description} onChange={e => setTripForm({ ...tripForm, description: e.target.value })} rows={4} required
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date de départ *</label>
                  <input type="date" value={tripForm.date} onChange={e => setTripForm({ ...tripForm, date: e.target.value })} required
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Durée</label>
                  <input type="text" placeholder="Ex: 3 jours, 2 nuits" value={tripForm.duration} onChange={e => setTripForm({ ...tripForm, duration: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Prix par personne (MAD) *</label>
                  <input type="number" placeholder="Ex: 2450" value={tripForm.price} onChange={e => setTripForm({ ...tripForm, price: e.target.value })} required
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Places disponibles</label>
                  <input type="number" placeholder="Ex: 15" value={tripForm.max_participants} onChange={e => setTripForm({ ...tripForm, max_participants: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Image de couverture</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px dashed var(--border-medium)', borderRadius: '10px', background: 'var(--bg-primary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--majorelle)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <UploadCloud size={18} />
                    <span>{imageFile ? imageFile.name : 'Choisir une image depuis l\'appareil...'}</span>
                    <input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files[0]); setTripForm({ ...tripForm, image_url: '' }); }} hidden />
                  </label>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>— OU —</div>
                  <input type="url" placeholder="Coller un lien URL d'image" value={tripForm.image_url}
                    onChange={e => { setTripForm({ ...tripForm, image_url: e.target.value }); setImageFile(null); }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)} fullWidth>Annuler</Button>
                <Button variant="primary" type="submit" disabled={saving} fullWidth>
                  {saving ? <><Loader2 size={16} className="spin" /> Sauvegarde...</> : (editingTripId ? 'Enregistrer les modifications' : 'Publier le voyage')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProof && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setSelectedProof(null)}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <button onClick={() => setSelectedProof(null)} style={{ position: 'absolute', top: '-40px', right: 0, background: 'var(--bg-card)', color: 'var(--text-primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
            <img src={selectedProof} alt="Preuve de paiement" style={{ width: '100%', borderRadius: '16px' }} />
          </div>
        </div>
      )}
      {/* --- PROFILE MODAL --- */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowProfileModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '100%', border: '1px solid var(--border-light)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings /> Modifier mon agence</h2>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px dashed var(--border-light)', marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.6rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Logo de l'agence</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <Avatar src={logoFile ? URL.createObjectURL(logoFile) : profileForm.avatar_url} size="lg" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--majorelle)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UploadCloud size={14} /> Télécharger depuis mon PC
                      <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} hidden />
                    </label>
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{logoFile ? logoFile.name : 'Aucun fichier sélectionné'}</p>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>— ou via un lien URL —</label>
                  <input type="url" placeholder="https://..." value={profileForm.avatar_url} onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#fff' }}>NOM DE L'AGENCE</label>
                <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#fff' }}>VILLE</label>
                  <input type="text" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#fff' }}>TÉLÉPHONE</label>
                  <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#fff' }}>DESCRIPTION</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#fff' }}>RIB BANCAIRE</label>
                <input type="text" value={profileForm.rib} onChange={e => setProfileForm({ ...profileForm, rib: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-medium)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="ghost" fullWidth type="button" onClick={() => setShowProfileModal(false)}>Annuler</Button>
                <Button variant="primary" fullWidth type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : 'Enregistrer les modifications'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
        borderRadius: '10px', border: 'none', background: active ? 'var(--majorelle)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)', fontWeight: active ? 600 : 500, fontSize: '0.95rem',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
      }}
      onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
      onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {icon} {label}
    </button>
  );
}