'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Wifi, Users, Calendar, Heart, BadgeCheck, Search, Filter, ChevronDown, QrCode, Clock, Camera, Plus, Check, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext'; // Ajout pour générer un QR unique par user
import { hosts } from '@/data/mock/hosts';
import styles from './page.module.css';

export default function HostingPage() {
  const router = useRouter();
  const { user } = useAuth(); // Récupération de l'user pour le QR Code
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [minCapacity, setMinCapacity] = useState('all');
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showReviews, setShowReviews] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [publishPhotoPreview, setPublishPhotoPreview] = useState(null); // Photo pour le logement

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

  const handlePublishPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPublishPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Génération du lien de données pour le QR Code (unique par utilisateur)
  const qrDataUrl = user
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin/${user.id}`
    : 'https://maghribiamsafra.com';

  return (
    <div className={styles.hosting}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.header_text}>
          <h1>🏡 Hébergement Solidaire</h1>
          <p>Trouvez un accueil chaleureux chez des femmes de confiance partout au Maroc</p>
        </div>
        <div className={styles.header_actions}>
          <Button variant="outline" onClick={() => setShowPublish(true)} style={{ borderColor: 'var(--border-light)' }}>
            {/* Alignement parfait et couleur qui s'adapte (blanc en dark mode) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Plus size={18} />
              <span>Publier mon logement</span>
            </div>
          </Button>
          <Button variant="primary" onClick={() => setShowQR(true)}>
            {/* Alignement parfait du QR avec le texte */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} />
              <span>Check-in QR</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Search & filters */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search size={20} />
          <input type="text" placeholder="Rechercher une ville ou un quartier..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {/* City Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ville</label>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            >
              {cities.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'Toutes les villes' : c}</option>
              ))}
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Disponibilité</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            >
              <option value="all">Tout moment</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          
          {/* Capacity Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Capacité min.</label>
            <select 
              value={minCapacity} 
              onChange={(e) => setMinCapacity(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            >
              <option value="all">Toute capacité</option>
              <option value="1">1 personne</option>
              <option value="2">2+ personnes</option>
              <option value="3">3+ personnes</option>
              <option value="4">4+ personnes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Host Grid */}
      <div className={styles.hostGrid}>
        {hosts
          .filter(h => {
            // City filter
            if (selectedCity !== 'all' && h.city !== selectedCity) return false;
            
            // Capacity filter
            if (minCapacity !== 'all' && h.maxGuests < parseInt(minCapacity)) return false;
            
            // Date filter (assuming hosts with availability field or all are available by default)
            if (selectedDate === 'this_week' || selectedDate === 'this_month' || selectedDate === 'flexible') {
              // For now, show all hosts for date filter (expand when availability data is added)
              return true;
            }
            
            return true;
          })
          .map(host => (
            <article key={host.id} className={styles.hostCard}>
              <div className={styles.hostCard_image}>
                <img src={host.photos[0]} alt={host.name} />
                {/* Le tag de disponibilité a été supprimé ici */}
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
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // Création du lien unique et du message personnalisé
                      const uniqueLink = `${window.location.origin}/hosting/${host.id}`;
                      const message = `Bonjour, en réponse à votre annonce de logement (${uniqueLink}), est-ce que ce logement est toujours disponible ?`;
                      router.push(`/messages?userId=${host.userId}&text=${encodeURIComponent(message)}`);
                    }}
                  >
                    Réserver
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
              /* Vrai QR Code généré et aligné */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrDataUrl)}`}
                  alt="QR Code Unique"
                  style={{ borderRadius: '12px', border: '4px solid white', boxShadow: 'var(--shadow-md)' }}
                />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Votre QR Code personnel</span>
              </div>
            )}

            <div className={styles.modal_actions}>
              {!showScanner && <Button variant="primary" fullWidth onClick={() => setShowScanner(true)}>Scanner le QR de l'hôte</Button>}
              <Button variant="ghost" fullWidth onClick={() => { setShowQR(false); setShowScanner(false); }}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal avec Photo */}
      {showPublish && (
        <div className={styles.modal_overlay} onClick={() => setShowPublish(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>🏡 Publier mon logement</h2>
            <p>Devenez hôte et accueillez des voyageuses du monde entier dans un esprit de solidarité.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

              {/* Ajout de la photo */}
              {publishPhotoPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={publishPhotoPreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button onClick={() => setPublishPhotoPreview(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', border: '2px dashed var(--border-medium)', borderRadius: '12px', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
                  <Camera size={32} color="var(--majorelle)" />
                  <span style={{ fontWeight: 500 }}>Ajouter une photo du logement</span>
                  <input type="file" accept="image/*" onChange={handlePublishPhotoSelect} hidden />
                </label>
              )}

              <input type="text" placeholder="Titre de l'annonce" className={styles.input} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Ville" style={{ flex: 1 }} className={styles.input} />
                <input type="text" placeholder="Quartier" style={{ flex: 1 }} className={styles.input} />
              </div>
              <textarea placeholder="Décrivez votre accueil..." className={styles.textarea} rows={4} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <Button variant="primary" fullWidth onClick={() => setShowPublish(false)}>Publier</Button>
                <Button variant="ghost" fullWidth onClick={() => { setShowPublish(false); setPublishPhotoPreview(null); }}>Annuler</Button>
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
