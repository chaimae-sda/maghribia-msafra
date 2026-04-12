'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Mail, Lock, User, MapPin, Camera, Shield, Eye, EyeOff, CheckCircle, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', city: '', password: '' });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

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
          <h2>Rejoignez-nous ! 🌍</h2>
          <p>Créez votre compte vérifié et commencez votre aventure avec des milliers de voyageuses marocaines.</p>
        </div>
      </div>

      <div className={styles.auth_right}>
        <div className={styles.auth_form_container}>
          {/* Steps */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.step_active : ''} ${step > 1 ? styles.step_done : ''}`}>
              <span className={styles.step_number}>{step > 1 ? '✓' : '1'}</span>
              <span className={styles.step_label}>Informations</span>
            </div>
            <div className={styles.step_line} />
            <div className={`${styles.step} ${step >= 2 ? styles.step_active : ''} ${step > 2 ? styles.step_done : ''}`}>
              <span className={styles.step_number}>{step > 2 ? '✓' : '2'}</span>
              <span className={styles.step_label}>Vérification KYC</span>
            </div>
            <div className={styles.step_line} />
            <div className={`${styles.step} ${step >= 3 ? styles.step_active : ''}`}>
              <span className={styles.step_number}>3</span>
              <span className={styles.step_label}>Confirmation</span>
            </div>
          </div>

          {/* Step 1: Info */}
          {step === 1 && (
            <>
              <div className={styles.auth_header}>
                <h1>Créer un compte</h1>
                <p>Remplissez vos informations personnelles pour commencer</p>
              </div>
              <form className={styles.auth_form} onSubmit={e => { e.preventDefault(); setStep(2); }}>
                <div className={styles.field}>
                  <label>Nom complet</label>
                  <div className={styles.inputWrap}>
                    <User size={18} />
                    <input type="text" placeholder="Votre nom complet" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <div className={styles.inputWrap}>
                    <Mail size={18} />
                    <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => updateForm('email', e.target.value)} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Ville</label>
                  <div className={styles.inputWrap}>
                    <MapPin size={18} />
                    <input type="text" placeholder="Votre ville" value={form.city} onChange={e => updateForm('city', e.target.value)} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Mot de passe</label>
                  <div className={styles.inputWrap}>
                    <Lock size={18} />
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 caractères" value={form.password} onChange={e => updateForm('password', e.target.value)} required />
                    <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button variant="primary" size="lg" fullWidth iconRight={<ArrowRight size={18} />}>
                  Continuer
                </Button>
                <p className={styles.auth_switch}>Déjà un compte ? <Link href="/login">Se connecter</Link></p>
              </form>
            </>
          )}

          {/* Step 2: KYC */}
          {step === 2 && (
            <>
              <div className={styles.auth_header}>
                <h1>Vérification d'identité</h1>
                <p>Pour la sécurité de toutes, nous vérifions chaque profil</p>
              </div>
              <div className={styles.auth_form}>
                <div className={styles.kyc_info}>
                  <Shield size={20} />
                  <span>Vos documents sont chiffrés et supprimés après vérification. Conformité loi 09-08 / RGPD.</span>
                </div>

                <div className={styles.kyc_upload}>
                  <div className={styles.kyc_upload_icon}>🪪</div>
                  <h3>Pièce d'identité</h3>
                  <p>Prenez en photo votre CIN ou passeport</p>
                </div>

                <div className={styles.kyc_upload}>
                  <div className={styles.kyc_upload_icon}>🤳</div>
                  <h3>Selfie de vérification</h3>
                  <p>Prenez un selfie en direct pour confirmer votre identité</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)} icon={<ArrowLeft size={18} />}>
                    Retour
                  </Button>
                  <Button variant="primary" size="lg" fullWidth iconRight={<ArrowRight size={18} />} onClick={() => setStep(3)}>
                    Vérifier
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div style={{ textAlign: 'center', paddingTop: 'var(--space-10)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-6)' }}>🎉</div>
              <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Bienvenue !</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
                Votre compte a été créé avec succès. Votre vérification est en cours de traitement.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center', padding: 'var(--space-4)', background: 'rgba(42,157,143,0.08)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)' }}>
                <CheckCircle size={20} style={{ color: 'var(--jade)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--jade-dark)' }}>Statut: Vérification en cours (estimation: 24h)</span>
              </div>
              <Link href="/feed">
                <Button variant="primary" size="lg" fullWidth iconRight={<ArrowRight size={18} />}>
                  Découvrir la communauté
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
