'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Globe, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle } = useAuth();

  // Redirect to new agency login if using old URL parameter
  useEffect(() => {
    if (searchParams.get('role') === 'agency') {
      router.replace('/login-agency');
    }
  }, [searchParams, router]);

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

    setLoading(false);

    if (signInError) {
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
        .from('profiles').select('role').eq('id', data.user.id).single();
      
      if (prof?.role === 'agency') {
        const { signOut } = await import('@/context/AuthContext');
        await (await import('@/lib/supabase')).supabase.auth.signOut();
        setLoading(false);
        setError("Accès refusé : Ce portail est réservé aux voyageuses. Veuillez utiliser l'accès Agence.");
        return;
      }
    }
    
    router.push('/feed');
  };

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
          <h2>Bienvenue ! 👋</h2>
          <p>Connectez-vous pour rejoindre votre communauté de voyageuses marocaines.</p>
        </div>
      </div>

      <div className={styles.auth_right}>
        <div className={styles.auth_form_container}>
          <div className={styles.auth_header}>
            <h1>Se connecter</h1>
            <p>Entrez vos identifiants pour accéder à votre compte</p>
          </div>

          {error && (
            <div className={styles.errorBanner} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>⚠️ {error}</span>
                <button onClick={() => setError('')}>✕</button>
              </div>
              {error.includes("accès Agence") && (
                <Link href="/login-agency" style={{ 
                  color: 'var(--rose)', 
                  fontWeight: 600, 
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px'
                }}>
                  Aller vers le portail Agence <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}

          <form className={styles.auth_form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
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
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className={styles.forgot}>Mot de passe oublié ?</a>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              iconRight={loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button 
              type="button" 
              className={styles.socialBtn}
              onClick={() => signInWithGoogle(typeof window !== 'undefined' ? `${window.location.origin}/feed` : 'http://localhost:3000/feed')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>

            <p className={styles.auth_switch}>
              Pas encore de compte ? <Link href="/register">Créer un compte</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
