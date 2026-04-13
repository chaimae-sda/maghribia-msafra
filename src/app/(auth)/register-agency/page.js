'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Mail, Lock, Phone, MapPin, FileText, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from '../login/page.module.css';

export default function RegisterAgencyPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: '', description: '', rib: ''
  });
  const [logoFile, setLogoFile] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.city || !form.rib) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Upload Logo if present
      let avatarUrl = '';
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(`logos/${fileName}`, logoFile);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`logos/${fileName}`);
          avatarUrl = publicUrl;
        }
      }

      // 2. Create supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, role: 'agency' } }
      });

      if (authError) throw authError;

      // 3. Create profile as agency (pending approval)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: form.email,
        full_name: form.name,
        city: form.city,
        role: 'agency',
        is_approved: false,
        avatar_url: avatarUrl,
        bio: form.description,
        social_links: { phone: form.phone, rib: form.rib },
      });

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className={styles.auth}>
        <div className={styles.auth_right} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.auth_form_container} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ marginBottom: '1rem' }}>Demande envoyée !</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Votre demande d'inscription a été envoyée avec succès. Notre équipe va examiner votre dossier et vous recevrez une notification dès que votre agence sera approuvée.
            </p>
            <Link href="/">
              <Button variant="primary">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.auth}>
      <div className={styles.auth_left}>
        <div className={styles.auth_bg}>
          <img src="/hero-bg.png" alt="" />
          <div className={styles.auth_overlay} />
        </div>
        <div className={styles.auth_brand}>
          <Link href="/" className={styles.auth_logo}>
            <img src="/logo.png" alt="Logo" width={64} height={64} />
            <span>Maghribia <strong>Msafra</strong></span>
          </Link>
          <h2>Espace Agences 🏢</h2>
          <p>Inscrivez votre agence de voyage et accédez à des milliers de voyageuses.</p>
        </div>
      </div>

      <div className={styles.auth_right}>
        <div className={styles.auth_form_container}>
          <div className={styles.auth_header}>
            <h1>Inscrire mon agence</h1>
            <p>Remplissez les informations de votre agence</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          <form className={styles.auth_form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Nom de l'agence *</label>
              <div className={styles.inputWrap}>
                <Building2 size={18} />
                <input type="text" placeholder="Nom de votre agence" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>Email professionnel *</label>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input type="email" placeholder="contact@votre-agence.ma" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>Mot de passe *</label>
              <div className={styles.inputWrap}>
                <Lock size={18} />
                <input type="password" placeholder="Min. 6 caractères" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Téléphone</label>
              <div className={styles.inputWrap}>
                <Phone size={18} />
                <input type="tel" placeholder="+212 6XX XXX XXX" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Ville *</label>
              <div className={styles.inputWrap}>
                <MapPin size={18} />
                <input type="text" placeholder="Siège de l'agence" value={form.city} onChange={e => update('city', e.target.value)} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>RIB Bancaire *</label>
              <div className={styles.inputWrap}>
                <FileText size={18} />
                <input type="text" placeholder="Votre RIB pour recevoir les paiements" value={form.rib} onChange={e => update('rib', e.target.value)} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>Logo de l'agence</label>
              <div className={styles.inputWrap} style={{ padding: '8px' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setLogoFile(e.target.files[0])}
                  style={{ border: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Description de l'agence</label>
              <textarea
                placeholder="Décrivez votre agence, vos spécialités..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            <Button variant="primary" size="lg" fullWidth disabled={loading}
              iconRight={loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
            >
              {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
            </Button>

            <p className={styles.auth_switch}>
              Vous êtes une voyageuse ? <Link href="/register">S'inscrire ici</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
