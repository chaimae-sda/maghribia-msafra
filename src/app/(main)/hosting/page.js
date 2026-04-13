'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Wifi, Users, Calendar, Heart, BadgeCheck, Search, Filter, ChevronDown, QrCode, Clock, Camera, Plus, Check } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { hosts } from '@/data/mock/hosts';
import styles from './page.module.css';

export default function HostingPage() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('all');
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showReviews, setShowReviews] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const videoRef = useRef(null);
  const cities = ['all', 'Fès', 'Essaouira', 'Marrakech', 'Rabat', 'Tanger', 'Casablanca'];

  useEffect(() => {
    if (showScanner && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner]);

  const handleScan = () => {
    setTimeout(() => {
      setScanSuccess(true);
      setTimeout(() => {
        setShowScanner(false);
        setShowQR(false);
        setScanSuccess(false);
      }, 2000);
    }, 3000);
  };

  return (
    <div className={styles.hosting}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.header_text}>
          <h1>🏡 Hébergement Solidaire</h1>
          <p>Trouvez un accueil chaleureux chez des femmes de confiance partout au Maroc</p>
        </div>
        <div className={styles.header_actions}>
          <Button variant="outline" onClick={() => setShowPublish(true)}>
            <Plus size={18} />
            Publier mon logement
          </Button>
          <Button variant="primary" onClick={() => setShowQR(true)}>
            <QrCode size={18} />
            Check-in QR
          </Button>
        </div>
      </div>

      {/* Search & filters */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={20} />
          <input type="text" placeholder="Rechercher une ville ou un quartier..." />
        </div>
        <div className={styles.cityFilters}>
          {cities.map(c => (
            <button
              key={c}
              className={`${styles.cityFilter} ${selectedCity === c ? styles.cityFilter_active : ''}`}
              onClick={() => setSelectedCity(c)}
            >
              {c === 'all' ? 'Toutes les villes' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Host Grid */}
      <div className={styles.hostGrid}>
        {hosts
          .filter(h => selectedCity === 'all' || h.city === selectedCity)
          .map(host => (
          <article key={host.id} className={styles.hostCard}>
            <div className={styles.hostCard_image}>
              <img src={host.photos[0]} alt={host.name} />
              <div className={styles.hostCard_overlay}>
                {host.available ? (
                  <Badge variant="jade" size="sm" dot>Disponible</Badge>
                ) : (
                  <Badge variant="default" size="sm">Prochaine dispo : {host.nextAvailable}</Badge>
                )}
              </div>
              <button className={styles.hostCard_fav}>
                <Heart size={18} />
              </button>
            </div>
            <div className={styles.hostCard_body}>
              <div className={styles.hostCard_top}>
                <div className={styles.hostCard_user}>
                  <Link href={`/profile/${host.userId}`}>
                    <Avatar src={host.avatar} alt={host.name} size="md" />
                  </Link>
                  <div>
                    <Link href={`/profile/${host.userId}`} className={styles.hostCard_name}>
                      {host.name}
                      <BadgeCheck size={14} className={styles.verified} />
                    </Link>
                    <Badge variant="gold" size="sm">{host.badge}</Badge>
                  </div>
                </div>
                <div className={styles.hostCard_rating} onClick={() => setShowReviews(host)} style={{ cursor: 'pointer' }}>
                  <Star size={16} fill="var(--saffron)" color="var(--saffron)" />
                  <strong>{host.rating}</strong>
                  <span>({host.reviewCount})</span>
                </div>
              </div>

              <div className={styles.hostCard_location}>
                <MapPin size={14} />
                <span>{host.city}, {host.neighborhood}</span>
              </div>

              <p className={styles.hostCard_desc}>{host.description}</p>

              <div className={styles.hostCard_amenities}>
                {host.amenities.slice(0, 4).map((a, i) => (
                  <span key={i} className={styles.amenity}>{a}</span>
                ))}
              </div>

              <div className={styles.hostCard_footer}>
                <div className={styles.hostCard_meta}>
                  <span><Users size={14} /> Max {host.maxGuests} {host.maxGuests > 1 ? 'personnes' : 'personne'}</span>
                  <span><Clock size={14} /> Rép. {host.responseTime}</span>
                </div>
                <Button 
                  variant={host.available ? 'primary' : 'ghost'} 
                  size="sm" 
                  disabled={!host.available}
                  onClick={() => router.push(`/messages?userId=${host.userId}&text=Bonjour, ce logement [${host.title}] (${host.photos[0]}) est-il toujours disponible ?`)}
                >
                  {host.available ? 'Réserver' : 'Indisponible'}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className={styles.modal_overlay} onClick={() => setShowQR(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>📱 Check-in / Check-out</h2>
            <p>Scannez le QR code de votre hôte pour confirmer votre arrivée ou départ en toute sécurité.</p>
            
            {showScanner ? (
              <div className={styles.scanner_container}>
                <video ref={videoRef} autoPlay playsInline className={styles.video_feed} />
                <div className={styles.scanner_overlay} />
                {scanSuccess ? (
                  <div className={styles.scan_success}>
                    <Check size={48} color="white" />
                    <span>Arrivée validée !</span>
                  </div>
                ) : (
                  <Button variant="ghost" className={styles.scan_sim_btn} onClick={handleScan}>Simuler scan</Button>
                )}
              </div>
            ) : (
              <div className={styles.qr_placeholder}>
                <QrCode size={120} strokeWidth={1} />
                <span>Votre QR Code personnel</span>
              </div>
            )}

            <div className={styles.modal_actions}>
              {!showScanner && <Button variant="primary" fullWidth onClick={() => setShowScanner(true)}>Scanner le QR de l'hôte</Button>}
              <Button variant="ghost" fullWidth onClick={() => { setShowQR(false); setShowScanner(false); }}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublish && (
        <div className={styles.modal_overlay} onClick={() => setShowPublish(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>🏡 Publier mon logement</h2>
            <p>Devenez hôte et accueillez des voyageuses du monde entier dans un esprit de solidarité.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input type="text" placeholder="Titre de l'annonce" className={styles.input} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Ville" style={{ flex: 1 }} className={styles.input} />
                <input type="text" placeholder="Quartier" style={{ flex: 1 }} className={styles.input} />
              </div>
              <textarea placeholder="Décrivez votre accueil..." className={styles.textarea} rows={4} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="primary" fullWidth onClick={() => setShowPublish(false)}>Publier</Button>
                <Button variant="ghost" fullWidth onClick={() => setShowPublish(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviews && (
        <div className={styles.modal_overlay} onClick={() => setShowReviews(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>⭐ Avis sur {showReviews.name}</h2>
            <div className={styles.reviews_list} style={{ marginTop: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {showReviews.reviews?.length > 0 ? showReviews.reviews.map((r, i) => (
                <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{r.author}</strong>
                    <div style={{ color: 'var(--saffron)' }}>{'★'.repeat(r.rating)}</div>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{r.comment}</p>
                </div>
              )) : <p>Aucun avis pour le moment.</p>}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f0f0f0' }}>
              <h4>Laisser un avis</h4>
              <textarea placeholder="Votre expérience chez cet hôte..." className={styles.textarea} style={{ marginTop: '0.5rem' }} />
              <Button variant="primary" style={{ marginTop: '1rem' }} fullWidth onClick={() => setShowReviews(null)}>Envoyer mon avis</Button>
            </div>
            <Button variant="ghost" fullWidth onClick={() => setShowReviews(null)} style={{ marginTop: '1rem' }}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}
