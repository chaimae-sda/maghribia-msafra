'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, ArrowLeft, Loader2, BadgeCheck, Send } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { virtualUsers } from '@/data/mock/virtualUsers';
import styles from './page.module.css';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  async function fetchPost() {
    // We only fetch from DB now. Ambassador posts should be seeded.
    const { data: interactionData } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url, city, is_ambassador)')
      .eq('id', id)
      .single();

    if (interactionData) {
      setPost(interactionData);
      fetchComments();
      fetchLikes();
    } else {
      setLoading(false);
    }
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setComments(data.map(c => ({
        id: c.id,
        user: c.profiles?.full_name || 'Utilisatrice',
        userId: c.user_id,
        avatar: c.profiles?.avatar_url,
        content: c.content
      })));
    }
  }

  async function fetchLikes() {
    const { count, data } = await supabase
      .from('likes')
      .select('user_id', { count: 'exact' })
      .eq('post_id', id);
    
    setLikesCount(count || 0);
    if (data && user) {
      setLiked(data.some(l => l.user_id === user.id));
    }
  }

  const toggleLike = async () => {
    if (!user || !post) return;
    
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      await supabase.from('likes').insert({ post_id: id, user_id: user.id });
    } else {
      setLiked(false);
      setLikesCount(prev => prev - 1);
      await supabase.from('likes').delete().match({ post_id: id, user_id: user.id });
    }
  };

  async function handleAddComment() {
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: id,
        user_id: user.id,
        content: newComment
      }])
      .select('*, profiles(full_name, avatar_url)')
      .single();

    if (data) {
      setComments(prev => [...prev, {
        id: data.id,
        user: data.profiles?.full_name || 'Moi',
        userId: data.user_id,
        avatar: data.profiles?.avatar_url,
        content: data.content
      }]);
      setNewComment('');
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="spin" /></div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '5rem' }}><h3>Publication introuvable</h3><Button onClick={() => router.back()}>Retour</Button></div>;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.back_btn}>
        <ArrowLeft size={20} /> Retour au fil
      </button>

      <article className={styles.post_detail}>
        <header className={styles.post_header}>
          <Link href={`/profile/${post.user?.id || post.user_id}`} className={styles.header_link} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <Avatar src={post.profiles?.avatar_url} size="lg" />
            <div className={styles.post_user_info}>
              <div className={styles.post_author}>
                {post.profiles?.full_name || 'Chaimae Saadi'}
                {post.profiles?.is_ambassador && <Badge variant="verified" size="sm" style={{marginLeft: '0.5rem'}}>Ambassadrice ✨</Badge>}
                {!post.profiles?.is_ambassador && <BadgeCheck size={16} className={styles.verified} />}
              </div>
              <div className={styles.post_meta}>
                <MapPin size={12} /> {post.city} • {new Date(post.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </Link>
        </header>

        <p className={styles.post_content}>{post.content}</p>

        {(post.image_url || post.image) && (
          <div className={styles.post_media} style={{ marginBottom: '1.5rem' }}>
            <img 
              src={post.image_url || post.image} 
              alt="Post media" 
              style={{ width: '100%', borderRadius: '12px', maxHeight: '500px', objectFit: 'cover' }} 
            />
          </div>
        )}

        <div className={styles.post_actions}>
          <button 
            className={`${styles.action_btn} ${liked ? styles.action_liked : ''}`}
            onClick={toggleLike}
          >
            <Heart size={20} fill={liked ? 'var(--rose)' : 'none'} /> 
            <span>{likesCount} Likes</span>
          </button>
          <button className={styles.action_btn}><MessageCircle size={20} /> <span>{comments.length} Commentaires</span></button>
          <button className={styles.action_btn}><Share2 size={20} /> <span>Partager</span></button>
          <button className={styles.action_btn}><Bookmark size={20} /></button>
        </div>

        <section className={styles.comments_section}>
          <h3>Commentaires</h3>
          <div className={styles.comments_list}>
            {comments.map(c => (
              <div key={c.id} className={styles.comment_card}>
                <Link href={`/profile/${c.userId || ''}`}>
                  <Avatar src={c.avatar} size="sm" />
                </Link>
                <div className={styles.comment_body}>
                  <p>
                    <Link href={`/profile/${c.userId || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong>{c.user}</strong>
                    </Link> {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!post.comments_disabled ? (
            <div className={styles.add_comment}>
              <textarea 
                placeholder="Votre commentaire..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={2}
              />
              <button disabled={!newComment.trim()} onClick={handleAddComment}>
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className={styles.comments_disabled_msg} style={{ padding: '1rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', color: '#666', border: '1px dashed #ccc' }}>
              Les commentaires ont été désactivés pour cette publication.
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
