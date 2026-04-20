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
import { posts as mockPosts } from '@/data/mock/posts';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  async function fetchPost() {
    try {
      // First try to fetch from database
      const { data: interactionData, error: dbError } = await supabase
        .from('posts')
        .select('*, profiles(id, full_name, avatar_url, city, is_ambassador)')
        .eq('id', id)
        .single();

      if (interactionData) {
        setPost({
          ...interactionData,
          user_id: interactionData.user_id,
          profiles: interactionData.profiles
        });
        fetchComments();
        fetchLikes();
        setLoading(false);
        return;
      }

      // Fallback to mock data
      const mockPost = mockPosts.find(p => p.id === id);
      if (mockPost) {
        setPost({
          id: mockPost.id,
          user_id: mockPost.userId,
          content: mockPost.content,
          image_url: mockPost.image,
          city: mockPost.city,
          created_at: new Date().toISOString(),
          profiles: {
            id: mockPost.userId,
            full_name: mockPost.userName,
            avatar_url: mockPost.userAvatar,
            city: mockPost.city,
            is_ambassador: mockPost.userBadge === 'Ambassadrice'
          }
        });
        
        // Set mock likes and comments
        setLikesCount(mockPost.likes || 0);
        setLiked(mockPost.liked || false);
        
        // Mock comments (you can add real comments in the future)
        setComments([
          {
            id: 'c1',
            user: 'Amina',
            userId: 'u5',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
            content: 'Magnifique ! J\'ai adoré ce lieu 😍'
          },
          {
            id: 'c2',
            user: 'Lila',
            userId: 'u6',
            avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=100',
            content: 'À absolument visiter !'
          }
        ]);
        setLoading(false);
        return;
      }

      setError('Post not found');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(id, full_name, avatar_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      
      if (data) {
        setComments(data.map(c => ({
          id: c.id,
          user: c.profiles?.full_name || 'Utilisatrice',
          userId: c.user_id || c.profiles?.id,
          avatar: c.profiles?.avatar_url,
          content: c.content
        })));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }

  async function fetchLikes() {
    try {
      const { count, data } = await supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('post_id', id);
      
      setLikesCount(count || 0);
      if (data && user) {
        setLiked(data.some(l => l.user_id === user.id));
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  }

  const toggleLike = async () => {
    if (!user || !post) return;
    
    try {
      if (!liked) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
        await supabase.from('likes').insert({ post_id: id, user_id: user.id });
      } else {
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        await supabase.from('likes').delete().match({ post_id: id, user_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert on error
      setLiked(!liked);
      setLikesCount(liked ? likesCount + 1 : Math.max(0, likesCount - 1));
    }
  };

  async function handleAddComment() {
    if (!newComment.trim() || !user) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: id,
          user_id: user.id,
          content: newComment
        }])
        .select('*, profiles(id, full_name, avatar_url)')
        .single();

      if (error) throw error;

      if (data) {
        setComments(prev => [...prev, {
          id: data.id,
          user: data.profiles?.full_name || 'Moi',
          userId: data.user_id || data.profiles?.id,
          avatar: data.profiles?.avatar_url,
          content: data.content
        }]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  }
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Loader2 className="spin" size={40} /></div>;
  if (error || !post) return (
    <div style={{ textAlign: 'center', padding: '5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ marginBottom: '1rem' }}>😕 Publication introuvable</h3>
      <Button onClick={() => router.back()}>Retour au fil</Button>
    </div>
  );

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.back_btn}>
        <ArrowLeft size={20} /> Retour
      </button>

      <article className={styles.post_detail}>
        {/* Post Header */}
        <header className={styles.post_header}>
          <Link href={`/profile/${post.profiles?.id || post.user_id}`} className={styles.header_link} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <Avatar src={post.profiles?.avatar_url} size="lg" />
            <div className={styles.post_user_info}>
              <div className={styles.post_author} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{post.profiles?.full_name || 'Utilisatrice'}</strong>
                {post.profiles?.is_ambassador && <Badge variant="verified" size="sm">Ambassadrice ✨</Badge>}
              </div>
              <div className={styles.post_meta}>
                <MapPin size={12} /> {post.city || 'Maroc'} • {new Date(post.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </Link>
        </header>

        {/* Post Content */}
        <p className={styles.post_content}>{post.content}</p>

        {/* Post Media */}
        {(post.image_url || post.image) && (
          <div className={styles.post_media} style={{ marginBottom: '1.5rem' }}>
            <img 
              src={post.image_url || post.image} 
              alt="Post media" 
              style={{ width: '100%', borderRadius: '12px', maxHeight: '500px', objectFit: 'cover' }} 
            />
          </div>
        )}

        {/* Post Actions */}
        <div className={styles.post_actions}>
          <button 
            className={`${styles.action_btn} ${liked ? styles.action_liked : ''}`}
            onClick={toggleLike}
            style={{ color: liked ? 'var(--rose)' : 'inherit' }}
          >
            <Heart size={20} fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} /> 
            <span>{likesCount} {likesCount !== 1 ? 'Likes' : 'Like'}</span>
          </button>
          <button className={styles.action_btn}>
            <MessageCircle size={20} /> <span>{comments.length} {comments.length !== 1 ? 'Commentaires' : 'Commentaire'}</span>
          </button>
          <button className={styles.action_btn}><Share2 size={20} /> <span>Partager</span></button>
          <button className={styles.action_btn}><Bookmark size={20} /></button>
        </div>

        {/* Comments Section */}
        <section className={styles.comments_section}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>💬 Commentaires ({comments.length})</h3>
          
          {/* Add Comment Form */}
          {user && (
            <div className={styles.add_comment} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <Avatar src={user?.user_metadata?.avatar_url} size="sm" />
              <div style={{ flex: 1 }}>
                <textarea 
                  placeholder="Votre commentaire..." 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: newComment.trim() ? 'var(--majorelle)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send size={16} /> Commenter
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className={styles.comments_list}>
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                Pas encore de commentaires. Soyez la première ! 🎉
              </p>
            ) : (
              comments.map(c => (
                <div key={c.id} className={styles.comment_card} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <Link href={`/profile/${c.userId}`} style={{ textDecoration: 'none' }}>
                    <Avatar src={c.avatar} size="sm" />
                  </Link>
                  <div className={styles.comment_body} style={{ flex: 1 }}>
                    <p style={{ margin: 0 }}>
                      <Link href={`/profile/${c.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ color: 'var(--majorelle)', cursor: 'pointer' }}>{c.user}</strong>
                      </Link> 
                      <span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>{c.content}</span>
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>À l'instant</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
