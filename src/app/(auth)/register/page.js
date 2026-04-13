'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Mail, Lock, User, MapPin, Shield, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/auth/OtpInput';
import CinVerifier from '@/components/auth/CinVerifier';
import FaceVerifier from '@/components/auth/FaceVerifier';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { user, profile, signUp, verifyOtp, resendOtp, signIn, createProfile, uploadAvatar, signInWithGoogle } = useAuth();

  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', city: '', password: '' });
  const [cinData, setCinData] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // Intercept Google Auth
  useEffect(() => {
    let mounted = true;
    async function setupGoogleProfile() {
      if (user && !profile && user.app_metadata?.provider === 'google') {
        setLoading(true);
        const name = user.user_metadata?.full_name || 'Voyageuse';
        const avatar = user.user_metadata?.avatar_url || null;
        await createProfile({ full_name: name, avatar_url: avatar, role: 'traveler' });
        if (mounted) {
          setLoading(false);
          router.push('/feed');
        }
      } else if (user && !profile && step < 3 && user.app_metadata?.provider !== 'google') {
        // User is authenticated (unfinished email signup) but no profile in DB -> Go to CIN
        setStep(3);
      } else if (user && profile) {
        if (profile.role === 'agency') {
          router.push('/agency');
        } else {
          router.push('/feed');
        }
      }
    }
    setupGoogleProfile();
    return () => { mounted = false; };
  }, [user, profile, router, step, createProfile]);

  // Step 1: Sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.city || !form.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.name,
      city: form.city,
    });

    if (signUpError) {
      if (signUpError.message === 'User already registered') {
        const { error: signInError } = await signIn({
          email: form.email,
          password: form.password,
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
             await resendOtp({ email: form.email });
             setStep(2);
             setLoading(false);
             return;
          }
          setError('Cet email est déjà utilisé (ou mot de passe incorrect).');
          setLoading(false);
          return;
        }

        // Il a pu se connecter : son email est confirmé !
        // Puisqu'il est là, c'est qu'il n'avait pas complètement fini la procédure (CIN et Photo)
        // On le passe directement à l'étape 3 pour reprendre où il s'est arrêté.
        setStep(3);
        setLoading(false);
        return;
      }

      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  };

  // Step 2: Verify OTP
  const handleOtpComplete = async (code) => {
    setLoading(true);
    setError('');

    const { data, error: otpError } = await verifyOtp({
      email: form.email,
      token: code,
    });

    setLoading(false);

    if (otpError) {
      setError('Code invalide. Veuillez réessayer.');
      return;
    }

    setStep(3);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    const { error: resendErr } = await resendOtp({ email: form.email });
    setLoading(false);
    if (resendErr) {
      setError('Erreur lors du renvoi du code.');
    } else {
      setError('Nouveau code envoyé avec succès !');
    }
  };

  // Step 3: CIN verified
  const handleCinVerified = (data) => {
    setCinData(data);
  };

  // Step 4: Face verified
  const handleFaceVerified = (data) => {
    setFaceData(data);
  };

  const handleAvatarReady = (file) => {
    setAvatarFile(file);
  };

  // Final: Create profile and redirect
  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        const { url, error: uploadErr } = await uploadAvatar(avatarFile);
        if (url) avatarUrl = url;
      }

      // Create profile
      const finalName = user?.user_metadata?.full_name || form.name;
      const finalAvatar = avatarUrl || user?.user_metadata?.avatar_url || null;

      const { data, error: profileError } = await createProfile({
        full_name: finalName,
        city: form.city || 'Non renseignée',
        cin_number: cinData?.number || '',
        cin_region: cinData?.region || '',
        avatar_url: finalAvatar,
        is_verified: true,
        gender_verified: faceData?.genderMatch || false,
        face_match_score: faceData?.faceSimilarity || faceData?.confidence || 0,
        verification_status: 'verified',
      });

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('Erreur lors de la création du profil. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      setStep(5);
      setTimeout(() => router.push('/profile'), 2500);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

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
          <h2>
            {step === 1 && 'Rejoignez-nous ! 🌍'}
            {step === 2 && 'Vérifiez votre email 📧'}
            {step === 3 && 'Vérification CIN 🪪'}
            {step === 4 && 'Vérification biométrique 🤳'}
            {step === 5 && 'Bienvenue ! 🎉'}
          </h2>
          <p>
            {step === 1 && 'Créez votre compte vérifié et commencez votre aventure avec des milliers de voyageuses marocaines.'}
            {step === 2 && 'Un code de vérification a été envoyé à votre adresse email.'}
            {step === 3 && 'Nous vérifions votre identité pour la sécurité de toutes.'}
            {step === 4 && 'Dernière étape : confirmez votre identité avec une photo.'}
            {step === 5 && 'Votre compte a été créé avec succès !'}
          </p>
        </div>
      </div>

      <div className={styles.auth_right}>
        <div className={styles.auth_form_container}>
          {/* Progress bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>Étape {step}/{totalSteps}</span>
          </div>

          {/* Steps indicator */}
          <div className={styles.steps}>
            {['Infos', 'Email', 'CIN', 'Photo', 'Fin'].map((label, i) => (
              <div key={i} className={`${styles.step} ${step >= i + 1 ? styles.step_active : ''} ${step > i + 1 ? styles.step_done : ''}`}>
                <span className={styles.step_number}>{step > i + 1 ? '✓' : i + 1}</span>
                <span className={styles.step_label}>{label}</span>
              </div>
            ))}
          </div>

          {/* Error display */}
          {error && (
            <div className={styles.errorBanner} style={{ backgroundColor: error.includes('succès') ? 'rgba(42, 157, 143, 0.1)' : undefined, color: error.includes('succès') ? 'var(--jade)' : undefined, borderColor: error.includes('succès') ? 'rgba(42, 157, 143, 0.3)' : undefined }}>
              <span>{error.includes('succès') ? '✅' : '⚠️'} {error}</span>
              <button style={{ color: error.includes('succès') ? 'var(--jade)' : undefined }} onClick={() => setError('')}>✕</button>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div className={styles.auth_header}>
                <h1>Créer un compte</h1>
                <p>Remplissez vos informations personnelles pour commencer</p>
              </div>
              
              <button 
                type="button" 
                className={styles.socialBtn} 
                style={{ marginBottom: '1.5rem', marginTop: '1rem', width: '100%' }}
                onClick={() => signInWithGoogle(typeof window !== 'undefined' ? `${window.location.origin}/feed` : 'http://localhost:3000/feed')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                S'inscrire avec Google
              </button>

              <div className={styles.divider} style={{ marginBottom: '1.5rem' }}>
                <span>ou avec un email</span>
              </div>

              <form className={styles.auth_form} onSubmit={handleSignUp}>
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
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 caractères" value={form.password} onChange={e => updateForm('password', e.target.value)} required minLength={6} />
                    <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button variant="primary" size="lg" fullWidth disabled={loading} iconRight={loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}>
                  {loading ? 'Inscription...' : 'Continuer'}
                </Button>
                <p className={styles.auth_switch}>Déjà un compte ? <Link href="/login">Se connecter</Link></p>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className={styles.auth_header}>
                <h1>📧 Vérification email</h1>
                <p>Un code à 6 chiffres a été envoyé à <strong>{form.email}</strong></p>
              </div>
              <div className={styles.auth_form}>
                <OtpInput onComplete={handleOtpComplete} disabled={loading} />

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--majorelle)' }}>
                    <Loader2 size={18} className="spin" />
                    <span style={{ fontSize: 'var(--text-sm)' }}>Vérification en cours...</span>
                  </div>
                )}

                <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Vous n'avez pas reçu le code ? <button type="button" onClick={handleResendOtp} disabled={loading} style={{ color: loading ? 'var(--text-muted)' : 'var(--majorelle)', fontWeight: 600, background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>Renvoyer</button>
                </p>

                <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={() => setStep(1)}>
                  Retour
                </Button>
              </div>
            </>
          )}

          {/* Step 3: CIN Verification */}
          {step === 3 && (
            <>
              <div className={styles.auth_header}>
                <h1>🪪 Vérification CIN</h1>
                <p>Entrez votre numéro de Carte d'Identité Nationale</p>
              </div>
              <div className={styles.auth_form}>
                <div className={styles.kyc_info}>
                  <Shield size={20} />
                  <span>Votre CIN est vérifié localement et n'est pas stocké en clair. Conformité loi 09-08 / RGPD.</span>
                </div>

                <CinVerifier onVerified={handleCinVerified} />

                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft size={18} />}>
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!cinData}
                    iconRight={<ArrowRight size={18} />}
                    onClick={() => setStep(4)}
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Face Verification */}
          {step === 4 && (
            <>
              <div className={styles.auth_header}>
                <h1>🤳 Vérification biométrique</h1>
                <p>Uploadez votre photo de profil puis prenez un selfie</p>
              </div>
              <div className={styles.auth_form}>
                <FaceVerifier
                  onVerified={handleFaceVerified}
                  onAvatarReady={handleAvatarReady}
                />

                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <Button variant="ghost" onClick={() => setStep(3)} icon={<ArrowLeft size={18} />}>
                    Retour
                  </Button>
                  {faceData && (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={loading}
                      iconRight={loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
                      onClick={handleComplete}
                    >
                      {loading ? 'Création du profil...' : 'Finaliser mon inscription'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 5: Welcome */}
          {step === 5 && (
            <div style={{ textAlign: 'center', paddingTop: 'var(--space-10)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-6)', animation: 'fadeInUp 0.5s var(--ease-out)' }}>🎉</div>
              <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Bienvenue, {form.name.split(' ')[0]} !</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
                Votre compte est vérifié et prêt. Redirection vers votre profil...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center', padding: 'var(--space-4)', background: 'rgba(42,157,143,0.08)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)' }}>
                <CheckCircle size={20} style={{ color: 'var(--jade)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--jade-dark)' }}>✓ Email vérifié • ✓ CIN validé • ✓ Identité confirmée</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--majorelle)' }}>
                <Loader2 size={18} className="spin" />
                <span style={{ fontSize: 'var(--text-sm)' }}>Redirection en cours...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
