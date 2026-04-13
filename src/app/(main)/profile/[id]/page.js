'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, MapPin, Star, MessageSquare, UserPlus, ArrowLeft,
  Compass, Home as HomeIcon, Heart, Calendar, Loader2, Check,
  MoreVertical, ShieldBan, UserMinus // <-- Nouveaux icônes ajoutés
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { virtualUsers } from '@/data/mock/virtualUsers';
import StoryModal from '@/components/features/StoryModal';
import styles from '../page.module.css';

export default function PublicProfilePage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { user: currentUser } = useAuth();

  const [targetProfile, setTargetProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null); // 'none', 'pending', 'accepted', 'blocked'
  const [isMe, setIsMe] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [viewingStory, setViewingStory] = useState(null);
  const [showAuthTeaser, setShowAuthTeaser] = useState(null);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false); // <-- État pour le menu

  useEffect(() => {
    if (currentUser?.id === id) {
      setIsMe(true);
      router.replace('/profile');
      return;
    }
    fetchProfileData();
    checkFriendship();
    fetchUserPosts();
    fetchUserStories();
  }, [id, currentUser]);

  async function fetchProfileData() {
    if (virtualUsers[id]) {
      setTargetProfile(virtualUsers[id]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) setTargetProfile(data);
    setLoading(false);
  }

  async function checkFriendship() {
    if (!currentUser) return;
    const { data } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser.id})`)
      .single();
    if (data) setFriendshipStatus(data.status);
    else setFriendshipStatus('none');
  }

  async function fetchUserPosts() {
    if (virtualUsers[id]) {
      setPosts(virtualUsers[id].posts || []);
      return;
    }

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setPosts(data);
  }

  async function fetchUserStories() {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', id)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setActiveStory({
        userId: id,
        userName: targetProfile?.full_name || 'Voyageuse',
        userAvatar: targetProfile?.avatar_url,
        stories: data
      });
    }
  }

  async function handleAddFriend() {
    if (!currentUser) {
      setShowAuthTeaser('like');
      return;
    }

    const { error } = await supabase.from('friendships').insert({
      user_id: currentUser.id,
      friend_id: id,
      status: 'pending'
    });
    if (!error) setFriendshipStatus('pending');
  }

  // --- NOUVELLES FONCTIONS : RETIRER & BLOQUER ---
  async function handleRemoveFriend() {
    if (!confirm('Voulez-vous vraiment retirer cette personne de vos amies ?')) return;

    const { error } = await supabase.from('friendships').delete()
      .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser.id})`);

    if (!error) {
      setFriendshipStatus('none');
      setShowOptionsPopup(false);
    } else {
      alert("Erreur lors de la suppression.");
    }
  }

  async function handleBlockUser() {
    if (!confirm('Voulez-vous vraiment bloquer cette personne ?')) return;

    if (friendshipStatus === 'none') {
      await supabase.from('friendships').insert({
        user_id: currentUser.id,
        friend_id: id,
        status: 'blocked'
      });
    } else {
      await supabase.from('friendships').update({ status: 'blocked' })
        .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUser.id})`);
    }

    setFriendshipStatus('blocked');
    setShowOptionsPopup(false);
    router.replace('/messages'); // On redirige après avoir bloqué
  }
  // -----------------------------------------------

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={32} className="spin" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!targetProfile || friendshipStatus === 'blocked') {
    return (
      <div className={styles.loading}>
        <p>{friendshipStatus === 'blocked' ? "Cet utilisateur est bloqué." : "Utilisatrice non trouvée."}</p>
        <Button onClick={() => router.back()} variant="secondary" size="sm" icon={<ArrowLeft size={16} />}>
          Retour
        </Button>
      </div>
    );
  }

  const memberSinceStr = targetProfile.created_at ? new Date(targetProfile.created_at).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  }) : 'récent';

  const memberSince = memberSinceStr === 'Invalid Date' ? 'récent' : memberSinceStr;

  return (
    <div className={styles.profile}>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className={styles.cover}>
        <div className={styles.cover_gradient} />
        <div className={styles.avatar_section}>
          <div className={styles.avatar_wrap}>
            <Avatar
              src={targetProfile.avatar_url}
              alt={targetProfile.full_name}
              size="2xl"
              hasStory={activeStory !== null}
              onClick={activeStory ? () => setViewingStory(activeStory) : null}
            />
            {targetProfile.is_verified && (
              <div className={styles.verified_badge} title="Profil vérifié">
                <Shield size={14} />
              </div>
            )}
          </div>
          <div className={styles.user_info}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1>{targetProfile.full_name || 'Voyageuse'}</h1>
                {targetProfile.is_ambassador && <Badge variant="verified" size="sm">Ambassadrice ✨</Badge>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {friendshipStatus === 'none' && (
                  <Button variant="primary" size="sm" icon={<UserPlus size={16} />} onClick={handleAddFriend}>
                    Ajouter
                  </Button>
                )}
                {friendshipStatus === 'pending' && (
                  <Button variant="secondary" size="sm" disabled>
                    En attente
                  </Button>
                )}
                {friendshipStatus === 'accepted' && (
                  <Button variant="primary" size="sm" icon={<MessageSquare size={16} />} onClick={() => {
                    if (!currentUser) return setShowAuthTeaser('comment');
                    router.push(`/messages?userId=${id}&text=Bonjour ${targetProfile.full_name.split(' ')[0]}, comment vas-tu ?`);
                  }}>
                    Message
                  </Button>
                )}
                {!currentUser && targetProfile.is_ambassador && friendshipStatus === 'none' && (
                  <Button variant="secondary" size="sm" icon={<MessageSquare size={16} />} onClick={() => setShowAuthTeaser('ambassadrice')}>
                    Contacter
                  </Button>
                )}

                {/* --- MENU OPTIONS (3 points) --- */}
                {currentUser && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowOptionsPopup(!showOptionsPopup)}
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showOptionsPopup && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 50, border: '1px solid var(--border-light)', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>

                        <button onClick={handleBlockUser} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem', width: '100%', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,59,92,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <ShieldBan size={16} /> Bloquer
                        </button>

                        {friendshipStatus === 'accepted' && (
                          <button onClick={handleRemoveFriend} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem', width: '100%', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <UserMinus size={16} /> Retirer des amies
                          </button>
                        )}

                      </div>
                    )}
                  </div>
                )}
                {/* ------------------------------- */}

              </div>
            </div>
            <div className={styles.user_meta}>
              <span><MapPin size={14} /> {targetProfile.city || 'Maroc'}</span>
              <span><Calendar size={14} /> Membre depuis {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.profile_content}>
        <div className={styles.stats_grid}>
          <div className={styles.stat_card}>
            <Compass size={24} />
            <strong>{targetProfile.trips_count || 0}</strong>
            <span>Voyages</span>
          </div>
          <div className={styles.stat_card}>
            <HomeIcon size={24} />
            <strong>{targetProfile.hosting_count || 0}</strong>
            <span>Hébergements</span>
          </div>
          <div className={styles.stat_card}>
            <Star size={24} />
            <strong>{targetProfile.rating > 0 ? targetProfile.rating.toFixed(1) : '–'}</strong>
            <span>Note</span>
          </div>
          <div className={styles.stat_card}>
            <Heart size={24} />
            <strong>{posts.length}</strong>
            <span>Publications</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2>À propos</h2>
          <p className={styles.bio_text}>
            {targetProfile.bio || "Cette voyageuse n'a pas encore ajouté de biographie."}
          </p>
          {targetProfile.hobbies?.length > 0 && (
            <div className={styles.hobbies_display}>
              {targetProfile.hobbies.map(h => (
                <span key={h} className={styles.hobby_badge}>{h}</span>
              ))}
            </div>
          )}
          {targetProfile.social_links && (targetProfile.social_links.instagram || targetProfile.social_links.facebook || targetProfile.social_links.tiktok) && (
            <div className={styles.social_links_display} style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              {targetProfile.social_links.instagram && <a href={`https://instagram.com/${targetProfile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#E1306C' }}>📸 Instagram</a>}
              {targetProfile.social_links.facebook && <a href={targetProfile.social_links.facebook.startsWith('http') ? targetProfile.social_links.facebook : `https://facebook.com/${targetProfile.social_links.facebook}`} target="_blank" rel="noreferrer" style={{ color: '#1877F2' }}>📘 Facebook</a>}
              {targetProfile.social_links.tiktok && <a href={`https://tiktok.com/@${targetProfile.social_links.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#000000' }}>🎵 TikTok</a>}
            </div>
          )}
        </div>

        {posts.length > 0 ? (
          <div className={styles.section}>
            <h2>Publications</h2>
            <div className={styles.posts_list}>
              {posts.map(post => (
                <div key={post.id} className={styles.post_card}>
                  {post.image_url && (
                    <div style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                      {post.image_url.match(/\.(mp4|mov|webm)$/) ? (
                        <video src={post.image_url} controls style={{ width: '100%', display: 'block' }} />
                      ) : (
                        <img src={post.image_url} alt="Post" style={{ width: '100%', display: 'block' }} />
                      )}
                    </div>
                  )}
                  <p>{post.content}</p>
                  <div className={styles.post_meta}>
                    <span>{post.city && `📍 ${post.city}`}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.empty_state}>
            <div className={styles.empty_icon}>✍️</div>
            <h3>Aucune publication</h3>
          </div>
        )}
      </div>

      {viewingStory && (
        <StoryModal
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}

      {showAuthTeaser && (
        <AuthTeaserModal
          action={showAuthTeaser}
          onClose={() => setShowAuthTeaser(null)}
        />
      )}
    </div>
  );
}