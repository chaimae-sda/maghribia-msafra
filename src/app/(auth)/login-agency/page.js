'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function LoginAgencyPage() {
  const router = useRouter();
  const { signIn } = useAuth(); // Assuming signIn handles standard email/password

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signInError } = await signIn({ email, password });

    if (signInError) {
      setLoading(false);
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : signInError.message
      );
      return;
    }

    // Role verification
    if (data?.user) {
      const { data: prof } = await (await import('@/lib/supabase')).supabase
        .from('profiles').select('role, is_approved').eq('id', data.user.id).single();
      
      if (prof?.role !== 'agency') {
        const { signOut } = await import('@/context/AuthContext');
        await (await import('@/lib/supabase')).supabase.auth.signOut();
        setLoading(false);
        setError("Accès refusé : Ce compte n'est pas un compte Agence. Veuillez vous connecter sur l'espace Voyageuses.");
        return;
      }

      if (!prof.is_approved) {
        setLoading(false);
        setError("Votre compte agence n'a pas encore été approuvé. Veuillez vérifier vos emails ou contacter l'administration.");
        return;
      }

      router.push('/agency');
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth_left}>
        <div className={styles.auth_bg}>
          <img src="/hero-bg.png" alt="Travel Background" />
          <div className={styles.auth_overlay} />
        </div>
        <div className={styles.auth_brand}>
          <Link href="/" className={styles.auth_logo}>
            <Building2 size={28} color="#38bdf8" />
            <span>Maghribia <strong>Msafra Business</strong></span>
          </Link>
          <h2>Espace Agences Partenaires</h2>
          <p>
            Gérez vos offres, touchez des milliers de voyageuses et développez votre activité en toute simplicité.
          </p>
        </div>
      </div>

      <div className={styles.auth_right}>
        <div className={styles.auth_form_container}>
          <div className={styles.auth_header}>
            <h1>Connexion Pro</h1>
            <p>Accédez à votre tableau de bord agence</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          <form className={styles.auth_form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">Email professionnel</label>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="contact@votre-agence.ma"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Mot de passe</label>
              <div className={styles.inputWrap}>
                <Lock size={18} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.auth_options}>
              <label className={styles.checkbox}>
                <input type="checkbox" />
                <span>Mémoriser</span>
              </label>
              <a href="#" className={styles.forgot}>Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              className={styles.btn_submit}
              disabled={loading}
            >
              {loading ? <><Loader2 size={18} className="spin" /> Connexion...</> : <>Se connecter <ArrowRight size={18} /></>}
            </button>

            <p className={styles.auth_switch}>
              Pas encore partenaire ? <Link href="/register-agency">Inscrire mon agence</Link>
            </p>
            <p className={styles.auth_switch} style={{ marginTop: '1rem' }}>
              Vous êtes une voyageuse ? <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Retour à l'espace membre</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
