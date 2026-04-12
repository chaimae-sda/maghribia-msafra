'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className={styles.auth}>
      <div className={styles.auth_left}>
        <div className={styles.auth_bg}>
          <img src="/hero-bg.png" alt="" />
          <div className={styles.auth_overlay} />
        </div>
        <div className={styles.auth_brand}>
          <Link href="/" className={styles.auth_logo}>
            <img src="/logo.png" alt="Logo" width={48} height={48} />
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

          <form className={styles.auth_form} onSubmit={e => e.preventDefault()}>
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

            <Link href="/feed">
              <Button variant="primary" size="lg" fullWidth iconRight={<ArrowRight size={18} />}>
                Se connecter
              </Button>
            </Link>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button className={styles.socialBtn}>
              <Globe size={20} />
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
