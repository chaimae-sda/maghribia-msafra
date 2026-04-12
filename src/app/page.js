import Link from 'next/link';
import { Shield, Users, Home, MessageCircle, Calendar, ShoppingBag, ArrowRight, Star, MapPin, ChevronRight, Heart, Compass, Globe } from 'lucide-react';
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
  },
  {
    name: 'Nour E.',
    city: 'Tanger',
    text: 'En tant qu\'étudiante, je trouvais difficile de voyager seule. Cette plateforme m\'a permis de découvrir Essaouira en toute sécurité.',
    rating: 5,
  },
  {
    name: 'Khadija A.',
    city: 'Montréal',
    text: 'Expatriée au Canada, j\'utilise l\'app pour rester connectée avec le Maroc et planifier mes voyages de retour entre marocaines.',
    rating: 5,
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
            <img src="/logo.png" alt="Logo" width={56} height={56} />
            <span>Maghribia <strong>Msafra</strong></span>
          </Link>
          <div className={styles.hero_nav_right}>
            <Link href="/login" className={styles.hero_nav_link}>Se connecter</Link>
            <Link href="/register" className={styles.hero_cta_sm}>
              Rejoindre
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className={styles.hero_content}>
          <div className={styles.hero_badge}>
            <Globe size={16} />
            <span>🇲🇦 Plateforme 100% féminine & sécurisée</span>
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
              <Link href="/messages" key={i} className={styles.city_card}>
                <span className={styles.city_emoji}>{city.emoji}</span>
                <div className={styles.city_info}>
                  <h3>{city.name}</h3>
                  <span>{city.members} membres</span>
                </div>
                <ChevronRight size={20} className={styles.city_arrow} />
              </Link>
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
                    {t.name[0]}
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
              <img src="/logo.png" alt="Logo" width={48} height={48} />
              <span>Maghribia Msafra</span>
            </div>
            <p>La première plateforme de voyage au féminin au Maroc. Sécurisée, solidaire, authentique.</p>
          </div>
          <div className={styles.footer_links}>
            <div className={styles.footer_col}>
              <h4>Plateforme</h4>
              <Link href="/feed">Fil d'actualité</Link>
              <Link href="/hosting">Hébergement</Link>
              <Link href="/events">Événements</Link>
              <Link href="/shop">Voyages</Link>
            </div>
            <div className={styles.footer_col}>
              <h4>Sécurité</h4>
              <a href="#">Vérification KYC</a>
              <a href="#">Politique de confidentialité</a>
              <a href="#">Conditions d'utilisation</a>
              <a href="#">Conformité CNDP</a>
            </div>
            <div className={styles.footer_col}>
              <h4>Contact</h4>
              <a href="#">Support</a>
              <a href="#">contact@maghribiamsafra.ma</a>
              <a href="#">Instagram</a>
              <a href="#">Facebook</a>
            </div>
          </div>
          <div className={styles.footer_bottom}>
            <p>© 2024 Maghribia Msafra. Tous droits réservés. 🇲🇦</p>
            <p>Fait avec <Heart size={14} fill="var(--rose)" color="var(--rose)" /> au Maroc</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
