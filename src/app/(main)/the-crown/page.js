'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Check, X, Building2, MapPin, Phone, Loader2, RefreshCw, Mail, MessageCircle, LockPassword, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const ADMIN_EMAIL = 'chaimae.sadaoui@gmail.com'; 
const SECRET_PASSCODE = 'Maghribia2026!';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [locked, setLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [platformPayments, setPlatformPayments] = useState([]);
  const [stats, setStats] = useState({ totalCommissions: 0, totalSubscriptions: 0 });
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    // Only fetch if unlocked (passcode verified)
    if (!locked) {
      if (tab === 'payments') {
        fetchPlatformPayments();
      } else {
        fetchAgencies();
      }
      fetchAdminStats();
    }
  }, [locked, tab]);

  async function fetchAdminStats() {
     // Commissions (10% of all confirmed bookings)
     const { data: bookings } = await supabase
       .from('bookings')
       .select('trips(price)')
       .eq('status', 'confirmed');
     
     const commissions = (bookings || []).reduce((sum, b) => sum + (b.trips?.price || 0) * 0.1, 0);

     // Subscriptions (Sum of approved agency payments)
     const { data: payments } = await supabase
       .from('agency_platform_payments')
       .select('amount')
       .eq('status', 'approved');
     
     const subscriptions = (payments || []).reduce((sum, p) => sum + p.amount, 0);

     setStats({ totalCommissions: commissions, totalSubscriptions: subscriptions });
  }

  async function fetchPlatformPayments() {
    setLoading(true);
    const { data } = await supabase
      .from('agency_platform_payments')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setPlatformPayments(data || []);
    setLoading(false);
  }

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (passcode === SECRET_PASSCODE) {
      if (user && user.email === ADMIN_EMAIL) {
        // Failsafe: ensure only the designated admin email gets the admin role
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
      setLocked(false);
    } else {
      setPassError('Mot de passe incorrect');
    }
  }

  async function fetchAgencies() {
    setLoading(true);
    const query = supabase.from('profiles').select('*').eq('role', 'agency');
    if (tab === 'pending') query.eq('is_approved', false);
    else query.eq('is_approved', true);

    const { data } = await query.order('created_at', { ascending: false });
    setAgencies(data || []);
    setLoading(false);
  }

  async function handleApprove(id) {
    if (!window.confirm("Avez-vous bien reçu le paiement de cette agence avant de l'approuver ?")) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
      await fetchAgencies();
      alert("Agence approuvée avec succès !");
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(id) {
    if (!window.confirm("Voulez-vous vraiment rejeter cette agence ?")) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({ is_approved: false, role: 'rejected' }).eq('id', id);
      if (error) throw error;
      await fetchAgencies();
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprovePayment(id) {
    if (!window.confirm("Voulez-vous approuver ce paiement ? Cela validera la facture de l'agence et mettra à jour vos revenus.")) return;
    
    setApprovingId(id);
    try {
      console.log('Approuvant le paiement ID:', id);
      const { data, error } = await supabase
        .from('agency_platform_payments')
        .update({ status: 'approved' })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Erreur Supabase Update:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("Aucune ligne n'a été mise à jour. Vérifiez vos permissions (RLS) ou si l'ID est correct.");
      }

      console.log('Mise à jour réussie:', data);
      
      // Re-fetch everything to ensure sync
      await Promise.all([
        fetchPlatformPayments(),
        fetchAdminStats()
      ]);
      
      alert("Paiement approuvé avec succès !");
    } catch (err) {
      console.error('Erreur Catch:', err);
      alert("Erreur lors de l'approbation du paiement : " + err.message);
    } finally {
      setApprovingId(null);
    }
  }

  if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>;

  if (locked) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <form onSubmit={handleUnlock} style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--majorelle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock size={32} color="#fff" />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Accès Restreint</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Veuillez entrer la clé maître pour accéder à l'espace administration.</p>
          
          <input 
            type="password" 
            placeholder="Mot de passe secret" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}
            autoFocus
          />
          {passError && <p style={{ color: 'var(--rose)', fontSize: '0.85rem', margin: '0 0 1rem' }}>{passError}</p>}
          
          <Button variant="primary" size="lg" fullWidth type="submit">Déverrouiller</Button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Shield size={32} style={{ color: 'var(--rose)' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)' }}>Administration (The Crown)</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gérer et facturer les agences de voyage</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setTab('pending')}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: tab === 'pending' ? 'var(--rose)' : '#f0f0f0',
            color: tab === 'pending' ? '#fff' : '#666'
          }}
        >
          ⏳ En attente ({tab === 'pending' ? agencies.length : '?'})
        </button>
        <button
          onClick={() => setTab('approved')}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: tab === 'approved' ? 'var(--jade)' : '#f0f0f0',
            color: tab === 'approved' ? '#fff' : '#666'
          }}
        >
          ✅ Approuvées
        </button>
        <button
          onClick={() => setTab('payments')}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: tab === 'payments' ? 'var(--majorelle)' : '#f0f0f0',
            color: tab === 'payments' ? '#fff' : '#666'
          }}
        >
          💰 Paiements Reçus
        </button>
        <button onClick={fetchAgencies} style={{ padding: '0.6rem', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#f0f0f0' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>}

      {!loading && tab === 'payments' && platformPayments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
          <h3 style={{ color: 'var(--text-primary)' }}>Aucun reçu de paiement soumis</h3>
        </div>
      )}

      {/* ADMIN STATS SECTION */}
      {!loading && !locked && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
           <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Total Commissions (10%)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--jade)' }}>{(stats.totalCommissions).toLocaleString()} MAD</div>
           </div>
           <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Total Abonnements</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--majorelle)' }}>{(stats.totalSubscriptions).toLocaleString()} MAD</div>
           </div>
           <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'var(--majorelle)', color: '#fff' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Revenu Total Brût</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{(stats.totalCommissions + stats.totalSubscriptions).toLocaleString()} MAD</div>
           </div>
        </div>
      )}

      {tab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION : À APPROUVER */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(231,76,60,0.1)', color: 'var(--rose)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
                {platformPayments.filter(p => p.status === 'pending').length} EN ATTENTE
              </div>
              <h3 style={{ margin: 0 }}>Réception des factures</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {platformPayments.filter(p => p.status === 'pending').length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed #ccc' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Aucun nouveau paiement à approuver.</p>
                </div>
              )}
              {platformPayments.filter(p => p.status === 'pending').map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Building2 color="var(--majorelle)" />
                      <div>
                        <h4 style={{ margin: 0 }}>{p.profiles?.full_name}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mois: {p.month} · Montant: {p.amount} MAD</p>
                      </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--majorelle)', fontWeight: 600 }}>Voir le reçu</a>
                      )}
                      <button 
                        onClick={() => handleApprovePayment(p.id)} 
                        disabled={approvingId === p.id}
                        style={{ 
                          background: 'var(--jade)', color: '#fff', border: 'none', padding: '0.5rem 1rem', 
                          borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' 
                        }}
                      >
                        {approvingId === p.id ? <Loader2 className="spin" size={16} /> : <Check size={16} />} 
                        Approuver
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION : HISTORIQUE (VALIDÉS) */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(42,157,143,0.1)', color: 'var(--jade)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
                {platformPayments.filter(p => p.status === 'approved').length} VALIDÉS
              </div>
              <h3 style={{ margin: 0 }}>Historique des paiements</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {platformPayments.filter(p => p.status === 'approved').map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(42,157,143,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={16} color="var(--jade)" />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{p.profiles?.full_name}</h5>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.month} · {p.amount} MAD</p>
                    </div>
                  </div>
                  <Badge variant="jade">Approuvé</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(tab === 'pending' || tab === 'approved') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agencies.map(agency => {
          // Format phone number for WhatsApp
          const phoneForWa = agency.social_links?.phone ? agency.social_links.phone.replace(/[^0-9]/g,'') : null;
          // Format date joined
          const joinedDate = new Date(agency.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          return (
            <div key={agency.id} style={{
              background: 'var(--bg-card)', borderRadius: '20px', padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid var(--border-light)',
              display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(96,98,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} style={{ color: 'var(--majorelle)' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{agency.full_name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {agency.city}
                    </p>
                  </div>
                </div>
                {/* Actions Top Right */}
                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleApprove(agency.id)} style={{ background: 'var(--jade)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', transition: 'filter 0.2s' }} onMouseOver={e=>e.currentTarget.style.filter='brightness(1.1)'} onMouseOut={e=>e.currentTarget.style.filter='none'}>
                      <Check size={18} /> Approuver
                    </button>
                    <button onClick={() => handleReject(agency.id)} style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#eee'} onMouseOut={e=>e.currentTarget.style.background='#f5f5f5'}>
                      <X size={18} /> Refuser
                    </button>
                  </div>
                )}
              </div>

              {/* Infos Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Contact</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{agency.email}</span>
                  </div>
                  {agency.social_links?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{agency.social_links.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Inscription</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px' }}>{joinedDate}</div>
                </div>
                {agency.social_links?.rib && (
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Paiement (RIB)</span>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '4px' }}>{agency.social_links.rib}</div>
                  </div>
                )}
              </div>

              {agency.bio && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0 0.5rem', borderLeft: '3px solid var(--majorelle)' }}>
                    "{agency.bio}"
                  </div>
              )}

              {/* Direct Contact Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #eee', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <a 
                  href={`mailto:${agency.email}?subject=Bienvenue sur Maghribia Msafra - Paiement Frais d'Inscription&body=Bonjour l'équipe de ${agency.full_name},%0D%0A%0D%0AMerci pour votre inscription ! Pour valider et publier vos offres, merci de procéder au règlement de votre abonnement sur le RIB de Maghribia Msafra : [VOTRE RIB].%0D%0A%0D%0AÀ très vite,%0D%0AChaimae`} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', background: 'rgba(96,98,255,0.1)', color: 'var(--majorelle)', textDecoration: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(96,98,255,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(96,98,255,0.1)'}
                >
                  <Mail size={16} /> Envoyer Email
                </a>
                
                {phoneForWa && (
                  <a 
                    href={`https://wa.me/${phoneForWa}?text=Bonjour l'équipe de ${agency.full_name}, c'est Chaimae de Maghribia Msafra ! 🎉 J'ai bien reçu votre demande d'inscription. Pour l'approuver que vous puissiez poster vos offres, n'oubliez pas de payer votre compte pro : [RIB ICI]. Hâte de vous voir sur la plateforme !`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', background: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem', transition: 'filter 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'none'}
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
