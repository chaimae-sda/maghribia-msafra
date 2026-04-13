'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Home, MessageCircle, Calendar, ShoppingBag, ArrowRight, Star, MapPin, ChevronRight, Heart, Compass, Globe, Building2, X } from 'lucide-react';
import AuthTeaserModal from '@/components/features/AuthTeaserModal';
import styles from './page.module.css';

const features = [
  {
    icon: <Shield size={28} />,
    title: 'Sécurité Vérifiée',
    description: 'Vérification d\'identité biométrique pour chaque membre. Voyagez l\'esprit tranquille.',
    color: 'jade',
  },
  {
    icon: <Users size={28} />,
    title: 'Hébergement Solidaire',
    description: 'Accueillez ou soyez accueillie par des femmes de confiance partout au Maroc.',
    color: 'terracotta',
  },
  {
    icon: <MessageCircle size={28} />,
    title: 'Entraide par Ville',
    description: 'Rejoignez les canaux de votre ville et connectez-vous avec la communauté locale.',
    color: 'majorelle',
  },
  {
    icon: <Calendar size={28} />,
    title: 'Événements & Sorties',
    description: 'Randonnées, ateliers cuisine, weekends surf... Créez et rejoignez des aventures.',
    color: 'saffron',
  },
  {
    icon: <ShoppingBag size={28} />,
    title: 'Voyages Organisés',
    description: 'Circuits exclusifs entre femmes avec paiement sécurisé et garantie.',
    color: 'rose',
  },
  {
    icon: <Compass size={28} />,
    title: 'Fil d\'Actualité',
    description: 'Partagez vos photos, récits et conseils de voyage avec la communauté.',
    color: 'majorelle',
  },
];

const testimonials = [
  {
    name: 'Fatima Z.',
    city: 'Marrakech',
    text: 'Grâce à Maghribia Msafra, j\'ai pu organiser ma première randonnée dans l\'Atlas avec 8 femmes extraordinaires. Une expérience inoubliable !',
    rating: 5,
    image: '/testimonial_fatima.png'
  },
  {
    name: 'Nour E.',
    city: 'Tanger',
    text: 'En tant qu\'étudiante, je trouvais difficile de voyager seule. Cette plateforme m\'a permis de découvrir Essaouira en toute sécurité.',
    rating: 5,
    image: '/testimonial_nour.png'
  },
  {
    name: 'Khadija A.',
    city: 'Montréal',
    text: 'Expatriée au Canada, j\'utilise l\'app pour rester connectée avec le Maroc et planifier mes voyages de retour entre marocaines.',
    rating: 5,
    image: '/testimonial_khadija.png'
  },
];

const cities = [
  { name: 'Marrakech', emoji: '🌹', members: 890 },
  { name: 'Casablanca', emoji: '🏙️', members: 1240 },
  { name: 'Chefchaouen', emoji: '💙', members: 340 },
  { name: 'Fès', emoji: '🏛️', members: 450 },
  { name: 'Essaouira', emoji: '🌊', members: 320 },
  { name: 'Tanger', emoji: '⚓', members: 620 },
];

export default function LandingPage() {
  const [showAuthTeaser, setShowAuthTeaser] = useState(null);

  return (
    <div className={styles.landing}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.hero_bg}>
          <img src="/hero-bg.png" alt="Paysage marocain" className={styles.hero_img} />
          <div className={styles.hero_overlay} />
        </div>

        <nav className={styles.hero_nav}>
          <Link href="/" className={styles.hero_logo}>
            <img src="/logo.png" alt="Logo" width={80} height={80} />
            <span>Maghribia <strong>Msafra</strong></span>
          </Link>

          {/* Nouveau Design des Boutons de Navigation */}
          <div className={styles.hero_nav_right} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/login" style={{
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'opacity 0.2s ease',
            }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Connexion
            </Link>

            <Link href="/login-agency" style={{
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '0.6rem 1.25rem',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Building2 size={18} color="#FF758F" />
              Connexion Agence
            </Link>

            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #FF758F 0%, #E8567F 100%)',
              color: '#fff',
              padding: '0.6rem 1.5rem',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: 'none',
              boxShadow: '0 4px 15px rgba(232, 86, 127, 0.4)'
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 86, 127, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 86, 127, 0.4)';
              }}
            >
              Rejoindre
              <ArrowRight size={18} />
            </Link>
          </div>
        </nav>

        <div className={styles.hero_content}>
          <div className={styles.hero_badge}>
            <span>Plateforme 100% féminine & sécurisée</span>
          </div>
          <h1 className={styles.hero_title}>
            Voyagez entre<br />
            <span className={styles.hero_title_gradient}>femmes marocaines</span>
          </h1>
          <p className={styles.hero_subtitle}>
            Rejoignez la première communauté de voyage au féminin au Maroc.
            Partagez, hébergez, explorez — en toute confiance.
          </p>
          <div className={styles.hero_actions}>
            <Link href="/register" className={styles.hero_btn_primary}>
              <span>Créer mon compte</span>
              <ArrowRight size={20} />
            </Link>
            <Link href="/feed" className={styles.hero_btn_secondary}>
              Découvrir la communauté
            </Link>
          </div>

          {/* Agency Call-to-Action */}
          <div style={{
            marginTop: '2rem',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '1.25rem 1.5rem',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.75rem',
            maxWidth: '550px',
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            animation: 'fadeInUp 0.6s ease-out 0.2s both'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
              <Building2 size={22} color="var(--rose)" />
              Vous êtes une agence de voyage ?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}>
              Publiez vos offres exclusives et touchez notre communauté de voyageuses vérifiées.
            </p>
            <Link href="/register-agency" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fff',
              color: 'var(--majorelle)',
              padding: '0.5rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Inscrire mon agence <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.hero_stats}>
            <div className={styles.hero_stat}>
              <strong>2,500+</strong>
              <span>Voyageuses</span>
            </div>
            <div className={styles.hero_stat_divider} />
            <div className={styles.hero_stat}>
              <strong>120+</strong>
              <span>Hôtes vérifiées</span>
            </div>
            <div className={styles.hero_stat_divider} />
            <div className={styles.hero_stat}>
              <strong>45+</strong>
              <span>Villes</span>
            </div>
          </div>
        </div>

        {/* Moroccan arch decoration */}
        <div className={styles.hero_arch} />
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.section_container}>
          <div className={styles.section_header}>
            <span className={styles.section_tag}>Fonctionnalités</span>
            <h2 className={styles.section_title}>
              Tout ce dont vous avez besoin pour <span className="text-gradient">voyager sereinement</span>
            </h2>
            <p className={styles.section_desc}>
              Une plateforme complète pensée par et pour les femmes marocaines voyageuses.
            </p>
          </div>
          <div className={styles.features_grid}>
            {features.map((f, i) => (
              <div key={i} className={styles.feature_card} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`${styles.feature_icon} ${styles[`feature_icon_${f.color}`]}`}>
                  {f.icon}
                </div>
                <h3 className={styles.feature_title}>{f.title}</h3>
                <p className={styles.feature_desc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className={styles.cities}>
        <div className={styles.section_container}>
          <div className={styles.section_header}>
            <span className={styles.section_tag}>Communautés</span>
            <h2 className={styles.section_title}>Explorez les villes du Maroc</h2>
            <p className={styles.section_desc}>Rejoignez la communauté de votre ville et connectez-vous avec les voyageuses locales.</p>
          </div>
          <div className={styles.cities_grid}>
            {cities.map((city, i) => (
              <div
                key={i}
                className={styles.city_card}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAuthTeaser('city')}
              >
                <span className={styles.city_emoji}>{city.emoji}</span>
                <div className={styles.city_info}>
                  <h3>{city.name}</h3>
                  <span>{city.members} membres</span>
                </div>
                <ChevronRight size={20} className={styles.city_arrow} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.section_container}>
          <div className={styles.section_header}>
            <span className={styles.section_tag}>Témoignages</span>
            <h2 className={styles.section_title}>Ce que disent nos voyageuses</h2>
          </div>
          <div className={styles.testimonials_grid}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonial_card}>
                <div className={styles.testimonial_stars}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} fill="var(--saffron)" color="var(--saffron)" />
                  ))}
                </div>
                <p className={styles.testimonial_text}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.testimonial_author}>
                  <div className={styles.testimonial_avatar}>
                    {t.image ? (
                      <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      t.name[0]
                    )}
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span><MapPin size={12} /> {t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.cta_inner}>
          <h2>Prête pour l'aventure ? 🌍</h2>
          <p>Rejoignez des milliers de voyageuses marocaines et commencez votre prochaine aventure dès aujourd'hui.</p>
          <div className={styles.cta_actions}>
            <Link href="/register" className={styles.cta_btn}>
              <span>S'inscrire gratuitement</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footer_inner}>
          <div className={styles.footer_brand}>
            <div className={styles.footer_logo}>
              <img src="/logo.png" alt="Logo" width={64} height={64} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Maghribia <span style={{ color: 'var(--rose)' }}>Msafra</span></span>
            </div>
            <p style={{ maxWidth: '350px', opacity: 0.8, lineHeight: '1.6' }}>
              La première plateforme de voyage au féminin au Maroc.
              Sécurisée, solidaire et authentique.
            </p>
          </div>

          <div className={styles.footer_links}>
            <div className={styles.footer_col}>
              <h4>Plateforme</h4>
              <a
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); setShowAuthTeaser('feed'); }}
              >
                Fil d'actualité
              </a>
              <a
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); setShowAuthTeaser('hosting'); }}
              >
                Hébergement
              </a>
              <a
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); setShowAuthTeaser('evenements'); }}
              >
                Événements
              </a>
              <a
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); setShowAuthTeaser('voyages'); }}
              >
                Voyages
              </a>
            </div>

            <div className={styles.footer_col}>
              <h4>Sécurité</h4>
              <Link href="/kyc">Vérification KYC</Link>
              <Link href="/privacy">Politique de confidentialité</Link>
              <Link href="/terms">Conditions d'utilisation</Link>
              <Link href="/cndp">Conformité CNDP</Link>
            </div>

            <div className={styles.footer_col}>
              <h4>Contact</h4>
              <a href="mailto:contact@maghribiamsafra.ma">contact@maghribiamsafra.ma</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>

          <div className={styles.footer_bottom}>
            <p>© 2024 Maghribia Msafra. Tous droits réservés. 🇲🇦</p>
            <p>Fait avec <Heart size={14} fill="var(--rose)" color="var(--rose)" /> au Maroc</p>
          </div>
        </div>
      </footer>
      {/* Auth Teaser Modal */}
      {showAuthTeaser && (
        <AuthTeaserModal
          action={showAuthTeaser}
          onClose={() => setShowAuthTeaser(null)}
        />
      )}
    </div>
  );
}