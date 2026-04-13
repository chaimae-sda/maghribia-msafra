'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, MapPin, Star, Edit3, Camera, Globe, Plus, X, Check,
  Award, Compass, Home as HomeIcon, Heart, ChevronRight, Calendar, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const HOBBY_OPTIONS = [
  'Randonnée', 'Photographie', 'Cuisine', 'Surf', 'Yoga', 'Shopping',
  'Art & Culture', 'Lecture', 'Musique', 'Méditation', 'Camping', 'Plage',
  'Exploration urbaine', 'Artisanat', 'Gastronomie', 'Escalade',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, updateProfile, uploadAvatar } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editHobbies, setEditHobbies] = useState([]);
  const [editSocialLinks, setEditSocialLinks] = useState({ instagram: '', facebook: '', tiktok: '' });
  const [editVisibility, setEditVisibility] = useState('public');
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postingKind, setPostingKind] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditHobbies(profile.hobbies || []);
      setEditSocialLinks(profile.social_links || { instagram: '', facebook: '', tiktok: '' });
      setEditVisibility(profile.visibility || 'public');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setPosts(data);
  }

  const handlePostAction = async (postId, action, e) => {
    if (e) e.stopPropagation();

    if (action === 'delete') {
      setDeletingPostId(postId);
    } else if (action === 'delete-confirm') {
      setDeletingPostId(null);
      const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id);

      if (error) {
        alert('Erreur Profil : ' + error.message);
      } else {
        setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
      }
    } else if (action === 'delete-cancel') {
      setDeletingPostId(null);
    } else if (action === 'archive') {
      const { error } = await supabase.from('posts').update({ is_archived: true }).eq('id', postId).eq('user_id', user.id);
      if (error) {
        alert("Erreur lors de l'archivage (Profil) : " + error.message);
      } else {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    }
  };

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPostingKind(true);
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        content: newPost,
        city: profile?.city || '',
      }])
      .select()
      .single();

    if (data) {
      setPosts(prev => [data, ...prev]);
      setNewPost('');
    }
    setPostingKind(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateProfile({ bio: editBio, hobbies: editHobbies, social_links: editSocialLinks, visibility: editVisibility });
    setSaving(false);
    setEditing(false);
  }

  function toggleHobby(hobby) {
    setEditHobbies(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    );
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await uploadAvatar(file);
    if (url) {
      await updateProfile({ avatar_url: url });
    }
  }

  const scrollToPublications = () => {
    document.getElementById('publications-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={32} className="spin" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className={styles.loading}>
        <p>Redirection vers la connexion...</p>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className={styles.profile}>
      <div className={styles.cover}>
        <div className={styles.cover_gradient} />
        <div className={styles.avatar_section}>
          <div className={styles.avatar_wrap}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatar_img} />
            ) : (
              <div className={styles.avatar_placeholder}>
                {(profile.full_name || user?.user_metadata?.full_name || 'Voyageuse').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <label className={styles.avatar_edit}>
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
            {profile.is_verified && (
              <div className={styles.verified_badge} title="Profil vérifié">
                <Shield size={14} />
              </div>
            )}
          </div>
          <div className={styles.user_info}>
            <h1>{profile.full_name || user?.user_metadata?.full_name || 'Voyageuse'}</h1>
            <div className={styles.user_meta}>
              <span><MapPin size={14} /> {profile.city}</span>
              <span><Calendar size={14} /> Membre depuis {memberSince}</span>
            </div>
            {profile.verification_status === 'verified' && (
              <div className={styles.verified_tag}>
                <Shield size={12} /> Identité vérifiée
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.profile_content}>
        <div className={styles.stats_grid}>
          {/* Cliquables */}
          <div className={styles.stat_card} style={{ cursor: 'pointer' }} onClick={() => { }}>
            <Compass size={24} />
            <strong>{profile.trips_count}</strong>
            <span>Voyages</span>
          </div>
          <div className={styles.stat_card} style={{ cursor: 'pointer' }} onClick={() => { }}>
            <HomeIcon size={24} />
            <strong>{profile.hosting_count}</strong>
            <span>Hébergements</span>
          </div>
          <div className={styles.stat_card} style={{ cursor: 'pointer' }} onClick={() => { }}>
            <Star size={24} />
            <strong>{profile.rating > 0 ? profile.rating.toFixed(1) : '–'}</strong>
            <span>Note</span>
          </div>
          <div className={styles.stat_card} style={{ cursor: 'pointer' }} onClick={scrollToPublications}>
            <Heart size={24} />
            <strong>{posts.length}</strong>
            <span>Publications</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.section_header}>
            <h2>À propos</h2>
            <button onClick={() => setEditing(!editing)} className={styles.edit_btn}>
              <Edit3 size={16} /> {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          {editing ? (
            <div className={styles.edit_form}>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Parlez-nous de vous et de vos passions de voyage..."
                className={styles.bio_input}
                rows={4}
              />
              <div className={styles.hobbies_section}>
                <h3>Centres d'intérêt</h3>
                <div className={styles.hobbies_grid}>
                  {HOBBY_OPTIONS.map(hobby => (
                    <button
                      key={hobby}
                      className={`${styles.hobby_tag} ${editHobbies.includes(hobby) ? styles.hobby_tag_active : ''}`}
                      onClick={() => toggleHobby(hobby)}
                    >
                      {editHobbies.includes(hobby) && <Check size={12} />}
                      {hobby}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.hobbies_section}>
                <h3>Confidentialité</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    className={`${styles.visibility_btn} ${editVisibility === 'public' ? styles.visibility_btn_active : ''}`}
                    onClick={() => setEditVisibility('public')}
                  >
                    🌍 Compte Public
                  </button>
                  <button
                    className={`${styles.visibility_btn} ${editVisibility === 'private' ? styles.visibility_btn_active : ''}`}
                    onClick={() => setEditVisibility('private')}
                  >
                    🔒 Compte Privé
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                  {editVisibility === 'public'
                    ? "Tout le monde peut voir vos posts et les partager à l'extérieur."
                    : "Seules vos amies peuvent voir vos posts. Le partage externe est désactivé."}
                </p>
              </div>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={16} className="spin" /> Sauvegarde...</> : 'Sauvegarder'}
              </Button>
            </div>
          ) : (
            <>
              <p className={styles.bio_text}>
                {profile.bio || 'Aucune biographie ajoutée. Cliquez sur "Modifier" pour vous présenter à la communauté !'}
              </p>
              {profile.hobbies?.length > 0 && (
                <div className={styles.hobbies_display}>
                  {profile.hobbies.map(h => (
                    <span key={h} className={styles.hobby_badge}>{h}</span>
                  ))}
                </div>
              )}
              {profile.social_links && (profile.social_links.instagram || profile.social_links.facebook || profile.social_links.tiktok) && (
                <div className={styles.social_links_display} style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  {profile.social_links.instagram && <a href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#E1306C' }}>📸 Instagram</a>}
                  {profile.social_links.facebook && <a href={profile.social_links.facebook.startsWith('http') ? profile.social_links.facebook : `https://facebook.com/${profile.social_links.facebook}`} target="_blank" rel="noreferrer" style={{ color: '#1877F2' }}>📘 Facebook</a>}
                  {profile.social_links.tiktok && <a href={`https://tiktok.com/@${profile.social_links.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#000000' }}>🎵 TikTok</a>}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.section}>
          <h2>Publier</h2>
          <form onSubmit={handleCreatePost} className={styles.post_form}>
            <div className={styles.post_input_wrap}>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Partagez un moment de voyage, un conseil, une photo..."
                className={styles.post_input}
                rows={3}
              />
            </div>
            <Button variant="primary" size="sm" disabled={!newPost.trim() || postingKind}>
              {postingKind ? <><Loader2 size={14} className="spin" /> Publication...</> : 'Publier'}
            </Button>
          </form>
        </div>

        {/* Cible ID pour le scroll */}
        {posts.length > 0 && (
          <div className={styles.section} id="publications-section">
            <h2>Mes publications</h2>
            <div className={styles.posts_list}>
              {posts.map(post => (
                <div key={post.id} className={styles.post_card}>
                  <div className={styles.post_card_content} onClick={() => router.push(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
                    {post.image_url && (
                      <div className={styles.post_card_image}>
                        <img src={post.image_url} alt="Publication" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                      </div>
                    )}
                    <p>{post.content}</p>
                    <div className={styles.post_meta}>
                      <span>{post.city && `📍 ${post.city}`}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className={styles.post_card_actions}>
                    {deletingPostId === post.id ? (
                      <div className={styles.inline_confirm}>
                        <span>Supprimer ?</span>
                        <button onClick={(e) => handlePostAction(post.id, 'delete-confirm', e)} className={styles.confirm_yes}>OUI</button>
                        <button onClick={(e) => handlePostAction(post.id, 'delete-cancel', e)} className={styles.confirm_no}>NON</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={(e) => handlePostAction(post.id, 'archive', e)} title="Archiver">📁 Archiver</button>
                        <button onClick={(e) => handlePostAction(post.id, 'delete', e)} className={styles.delete_btn} title="Supprimer">🗑️ Supprimer</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 && (
          <div className={styles.empty_state} id="publications-section">
            <div className={styles.empty_icon}>✍️</div>
            <h3>Aucune publication pour le moment</h3>
            <p>Partagez votre première expérience de voyage avec la communauté !</p>
          </div>
        )}
      </div>
    </div>
  );
}