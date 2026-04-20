'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Image, Send, MoreHorizontal, BadgeCheck, Filter, X, Camera, Video, Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { virtualUsers } from '@/data/mock/virtualUsers';
import StoryModal from '@/components/features/StoryModal';
import AuthTeaserModal from '@/components/features/AuthTeaserModal';
import styles from './page.module.css';

export default function FeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [feedPosts, setFeedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const [trends, setTrends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activePostComments, setActivePostComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [showAuthTeaser, setShowAuthTeaser] = useState(null);

  // Stories state
  const [realStories, setRealStories] = useState([]);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [storyLocation, setStoryLocation] = useState('');
  const [uploadingStory, setUploadingStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyTimerRef = useRef(null);

  // Post creation state
  const [postMedia, setPostMedia] = useState(null);
  const [postMediaPreview, setPostMediaPreview] = useState(null);
  const [postMediaType, setPostMediaType] = useState(null);
  const [postLocation, setPostLocation] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    fetchStories();
    fetchPosts();
  }, [user]);

  function calculateTrends(posts) {
    const counts = {};
    posts.forEach(p => {
      p.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag: '#' + tag, count }));
    setTrends(sorted);
  }

  async function fetchSuggestions() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city')
        .neq('id', user?.id || '')
        .eq('role', 'traveler')
        .limit(5);

      const dbSuggestions = data || [];
      const virtualSuggestions = Object.values(virtualUsers).map(u => ({
        id: u.id,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        city: u.city,
        is_ambassador: true
      }));

      setSuggestions([...virtualSuggestions, ...dbSuggestions]);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      // Fallback to virtual users only
      const virtualSuggestions = Object.values(virtualUsers).slice(0, 5).map(u => ({
        id: u.id,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        city: u.city,
        is_ambassador: true
      }));
      setSuggestions(virtualSuggestions);
    }
  }

  async function fetchPosts() {
    try {
      setLoadingPosts(true);

      if (!user) {
        const dummyPosts = Object.values(virtualUsers).flatMap(u => (u.posts || []).map(p => ({
          id: `dummy-${p.id}`,
          userId: u.id,
          userName: u.full_name,
          userAvatar: u.avatar_url,
          city: u.city,
          timeAgo: 'il y a 2h',
          content: p.content,
          image: p.image_url,
          likes: Math.floor(Math.random() * 50) + 10,
          comments: Math.floor(Math.random() * 10) + 2,
          liked: false,
          tags: p.content.match(/#(\w|[À-ÿ])+/g)?.map(t => t.replace('#', '')) || [],
          comments_data: (u.comments || []).map(c => ({
            id: c.id,
            user: virtualUsers[c.userId]?.full_name || 'Amie',
            avatar: virtualUsers[c.userId]?.avatar_url,
            content: c.content
          }))
        })));
        setFeedPosts(dummyPosts);
        calculateTrends(dummyPosts);
        setLoadingPosts(false);
        return;
      }

      const { data, error: postsError } = await supabase
        .from('posts')
        .select('*, profiles(full_name, avatar_url, city, is_ambassador), likes(user_id)')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setFeedPosts([]);
        setLoadingPosts(false);
        return;
      }

      let finalPosts = [];

      if (data && data.length > 0) {
        const { data: allComments, error: commentsError } = await supabase
          .from('comments')
          .select('*, profiles(full_name, avatar_url)')
          .in('post_id', data.map(p => p.id));

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        }

        finalPosts = data.map(p => {
          const hashtags = p.content.match(/#(\w|[À-ÿ])+/g) || [];
          const postComments = (allComments || []).filter(c => c.post_id === p.id);
          const userHasLiked = (p.likes || []).some(l => l.user_id === user?.id);

          return {
            id: p.id,
            userId: p.user_id,
            userName: p.profiles?.full_name || 'Chaimae Saadi',
            userAvatar: p.profiles?.avatar_url,
            city: p.city || 'Maroc',
            timeAgo: 'récent',
            content: p.content,
            image: p.image_url,
            likes: p.likes_count || (p.likes ? p.likes.length : 0),
            comments: p.comments_count || postComments.length,
            liked: userHasLiked,
            tags: hashtags.map(t => t.replace('#', '')),
            comments_disabled: p.comments_disabled,
            comments_data: postComments.map(c => ({
              id: c.id,
              user: c.profiles?.full_name || 'Utilisatrice',
              userId: c.user_id,
              avatar: c.profiles?.avatar_url,
              content: c.content
            }))
          };
        });
      }

      setFeedPosts(finalPosts);
      calculateTrends(finalPosts);
      setLoadingPosts(false);
    } catch (err) {
      console.error('Error in fetchPosts:', err);
      setFeedPosts([]);
      setLoadingPosts(false);
    }
  }

  async function fetchStories() {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*, profiles!stories_user_id_fkey(full_name, avatar_url)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      if (data) {
        const grouped = {};
        data.forEach(s => {
          if (!grouped[s.user_id]) {
            grouped[s.user_id] = {
              userId: s.user_id,
              userName: s.profiles?.full_name || 'Anonyme',
              userAvatar: s.profiles?.avatar_url,
              stories: []
            };
          }
          grouped[s.user_id].stories.push(s);
        });
        setRealStories(Object.values(grouped));
      }
    } catch (err) {
      console.error('Error in fetchStories:', err);
      setRealStories([]);
    }
  }

  async function handleStoryUpload(e) {
    if (!user) return setShowAuthTeaser('story');
    const file = e.target.files[0];
    if (!file) return;

    setUploadingStory(true);
    const isVideo = file.type.startsWith('video/');
    const ext = file.name.split('.').pop();
    const fileName = `stories/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('media').upload(fileName, file);
    if (uploadErr) {
      alert('Erreur: ' + uploadErr.message);
      setUploadingStory(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

    await supabase.from('stories').insert({
      user_id: user.id,
      media_url: publicUrl,
      media_type: isVideo ? 'video' : 'image',
      location: storyLocation || null
    });

    setUploadingStory(false);
    setShowStoryUpload(false);
    setStoryLocation('');
    fetchStories();
  }

  function viewStory(storyGroup) {
    setViewingStory(storyGroup);
    setStoryProgress(0);
    startStoryTimer();
  }

  function startStoryTimer() {
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    setStoryProgress(0);
    storyTimerRef.current = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          clearInterval(storyTimerRef.current);
          setViewingStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
  }

  function closeStory() {
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    setViewingStory(null);
    setStoryProgress(0);
  }

  async function handleAddFriend(friendId) {
    await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    });
    alert('Demande envoyée !');
  }

  function handlePostMediaSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setPostMediaType(type);
      setPostMediaPreview(URL.createObjectURL(file));
    }
  }

  async function handleCreatePost() {
    if (!user) return setShowAuthTeaser('publier');
    if (!newPost.trim() && !postMedia) return;
    setPosting(true);

    let mediaUrl = null;
    if (postMedia) {
      if (postMedia.size > 50 * 1024 * 1024) {
        alert('La vidéo est trop lourde (max 50 Mo)');
        setPosting(false);
        return;
      }
      const ext = postMedia.name.split('.').pop();
      const fileName = `posts/${user.id}/${Date.now()}.${ext}`;
      await supabase.storage.from('media').upload(fileName, postMedia);
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      mediaUrl = publicUrl;
    }

    const { data } = await supabase.from('posts').insert({
      user_id: user.id,
      content: newPost,
      image_url: mediaUrl,
      city: postLocation || profile?.city || '',
    }).select().single();

    if (data) {
      setFeedPosts(prev => [{
        id: data.id,
        userId: user.id,
        userName: profile?.full_name || 'Moi',
        userAvatar: profile?.avatar_url,
        city: data.city,
        content: data.content,
        image: data.image_url,
        likes: 0, comments: 0, shares: 0,
        timeAgo: "À l'instant",
        tags: [],
        liked: false
      }, ...prev]);
    }

    setNewPost('');
    setPostMedia(null);
    setPostMediaPreview(null);
    setPostMediaType(null);
    setPostLocation('');
    setPosting(false);
  }

  const filters = ['all', 'Marrakech', 'Chefchaouen', 'Fès', 'Essaouira', 'Tanger'];

  const toggleLike = async (postId) => {
    if (!user) return setShowAuthTeaser('like');

    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));

    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;

    if (!post.liked) {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
    }
  };

  const toggleSave = (postId) => {
    if (!user) return setShowAuthTeaser('enregistrer');
    setSavedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleShare = (post) => {
    if (!user) return setShowAuthTeaser('share');
    setShowShareModal(post);
  };

  const handleComment = async (postId) => {
    if (!user) return setShowAuthTeaser('comment');
    if (!commentText.trim()) return;

    const { data: newComment, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: user.id,
        content: commentText
      }])
      .select('*, profiles(full_name, avatar_url)')
      .single();

    if (newComment) {
      const formattedComment = {
        id: newComment.id,
        user: newComment.profiles?.full_name || 'Moi',
        userId: newComment.user_id,
        avatar: newComment.profiles?.avatar_url,
        content: newComment.content
      };

      setFeedPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: (p.comments || 0) + 1,
            comments_data: [formattedComment, ...(p.comments_data || [])]
          };
        }
        return p;
      }));
      setCommentText('');
    }
  };

  const handlePostAction = async (postId, action, e) => {
    if (e) e.stopPropagation();
    if (!user) return;

    if (action === 'delete') {
      setDeletingPostId(postId);
    } else if (action === 'delete-confirm') {
      setDeletingPostId(null);
      setShowPostMenu(null);

      const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id);

      if (error) {
        alert('Erreur technique (Fil) : ' + error.message);
      } else {
        setFeedPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
      }
    } else if (action === 'delete-cancel') {
      setDeletingPostId(null);
    } else if (action === 'archive') {
      setShowPostMenu(null);
      const { error } = await supabase.from('posts').update({ is_archived: true }).eq('id', postId).eq('user_id', user.id);
      if (!error) setFeedPosts(prev => prev.filter(p => p.id !== postId));
    } else if (action === 'toggle-comments') {
      setShowPostMenu(null);
      const post = feedPosts.find(p => p.id === postId);
      const newState = !post?.comments_disabled;
      const { error } = await supabase.from('posts').update({ comments_disabled: newState }).eq('id', postId).eq('user_id', user.id);
      if (!error) setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_disabled: newState } : p));
    }
  };

  // --- SÉPARATION DES STORIES (Ma story vs Autres) ---
  const myName = profile?.full_name?.split(' ')[0] || "Salma";

  const myStoryGroup = realStories.find(sg =>
    (user && sg.userId === user.id) ||
    (sg.userName && sg.userName.includes(myName))
  );

  const otherStories = realStories.filter(sg =>
    !(user && sg.userId === user.id) &&
    !(sg.userName && sg.userName.includes(myName))
  );

  return (
    <div className={styles.feed}>
      <div className={styles.feed_main}>
        {/* Stories */}
        <section className={styles.stories}>
          <div className={styles.stories_scroll}>

            {/* 1. MON AVATAR (Ma Story / Ajouter) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ position: 'relative' }} onClick={() => myStoryGroup ? setViewingStory(myStoryGroup) : setShowStoryUpload(true)}>
                <Avatar
                  src={profile?.avatar_url || myStoryGroup?.userAvatar}
                  alt="Moi"
                  size="lg"
                  hasStory={!!myStoryGroup}
                />

                <button
                  onClick={(e) => { e.stopPropagation(); setShowStoryUpload(true); }}
                  style={{
                    position: 'absolute', bottom: '0px', right: '-4px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'var(--majorelle)', color: 'white', border: '2px solid var(--bg-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 2, padding: 0, fontSize: '14px', lineHeight: 1
                  }}
                  title="Ajouter une story"
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Ma story
              </span>
            </div>

            {/* 2. LES AUTRES STORIES */}
            {otherStories.map(sg => (
              <button key={sg.userId} className={styles.story} onClick={() => setViewingStory(sg)}>
                <Avatar src={sg.userAvatar} alt={sg.userName} size="lg" hasStory={true} />
                <span>{sg.userName?.split(' ')[0]}</span>
              </button>
            ))}

          </div>
        </section>

        {/* Create Post */}
        <div className={styles.createPost}>
          <div className={styles.createPost_top}>
            <Avatar src={profile?.avatar_url} alt={profile?.full_name} size="md" />
            <input
              type="text"
              placeholder="Partagez votre aventure..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              className={styles.createPost_input}
            />
          </div>
          {postMediaPreview && (
            <div style={{ position: 'relative', margin: '0.5rem 1rem' }}>
              {postMediaType === 'video' ? (
                <video src={postMediaPreview} style={{ width: '100%', maxHeight: '400px', borderRadius: '12px' }} controls />
              ) : (
                <img src={postMediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }} />
              )}
              <button onClick={() => { setPostMedia(null); setPostMediaPreview(null); setPostMediaType(null); }}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <X size={14} />
              </button>
            </div>
          )}
          {postLocation && (
            <div style={{ margin: '0 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--majorelle)' }}>
              <MapPin size={14} /> {postLocation}
              <button onClick={() => setPostLocation('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={12} /></button>
            </div>
          )}
          <div className={styles.createPost_bottom}>
            <label className={styles.createPost_action} style={{ cursor: 'pointer' }}>
              <Camera size={18} />
              <span>Photo / Vidéo</span>
              <input type="file" accept="image/*,video/*" onChange={handlePostMediaSelect} hidden />
            </label>
            <button className={styles.createPost_action} onClick={() => {
              const loc = prompt('📍 Entrez votre localisation :');
              if (loc) setPostLocation(loc);
            }}>
              <MapPin size={18} />
              <span>Lieu</span>
            </button>
            <button className={styles.createPost_submit} disabled={(!newPost.trim() && !postMedia) || posting} onClick={handleCreatePost}>
              {posting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              <span>{posting ? 'Publication...' : 'Publier'}</span>
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <Filter size={16} />
          {filters.map(f => (
            <button
              key={f}
              className={`${styles.filter_btn} ${activeFilter === f && !activeTag ? styles.filter_btn_active : ''}`}
              onClick={() => { setActiveFilter(f); setActiveTag(null); }}
            >
              {f === 'all' ? 'Tout' : f}
            </button>
          ))}
          {activeTag && (
            <button
              className={`${styles.filter_btn} ${styles.filter_btn_active}`}
              onClick={() => setActiveTag(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              #{activeTag} <X size={14} />
            </button>
          )}
        </div>


        {/* Posts */}
        <div className={styles.posts}>
          {loadingPosts && (
            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" size={32} /></div>
          )}

          {!loadingPosts && feedPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '20px', border: '1px solid #eee' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3>Le fil est encore calme...</h3>
              <p style={{ color: '#666' }}>Partagez votre première aventure pour lancer la discussion !</p>
            </div>
          )}

          {feedPosts
            .filter(p => (activeFilter === 'all' || p.city === activeFilter) && (!activeTag || p.tags.includes(activeTag)))
            .map(post => (
              <article key={post.id} className={styles.post}>
                <div className={styles.post_header}>
                  <Link href={`/profile/${post.userId}`} className={styles.post_header_link} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <Avatar src={post.userAvatar} alt={post.userName} size="md" />
                    <div className={styles.post_userInfo}>
                      <div className={styles.post_userName}>
                        {post.userName}
                        <BadgeCheck size={16} className={styles.verified_icon} />
                      </div>
                      <div className={styles.post_meta}>
                        <MapPin size={12} />
                        <span>{post.city}</span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    className={styles.post_more}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPostMenu(showPostMenu === post.id ? null : post.id);
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {showPostMenu === post.id && (
                    <div className={styles.post_menu}>
                      {post.userId === user?.id ? (
                        <>
                          {deletingPostId === post.id ? (
                            <div className={styles.confirm_zone}>
                              <p>Supprimer ?</p>
                              <button onClick={(e) => handlePostAction(post.id, 'delete-confirm', e)} className={styles.confirm_yes}>OUI</button>
                              <button onClick={(e) => handlePostAction(post.id, 'delete-cancel', e)} className={styles.confirm_no}>NON</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={(e) => handlePostAction(post.id, 'toggle-comments', e)}>
                                {post.comments_disabled ? 'Activer les commentaires' : 'Désactiver les commentaires'}
                              </button>
                              <button onClick={(e) => handlePostAction(post.id, 'archive', e)}>Archiver</button>
                              <button
                                type="button"
                                onClick={(e) => handlePostAction(post.id, 'delete', e)}
                                className={styles.delete_btn}
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <button onClick={() => setShowPostMenu(null)}>Signaler</button>
                          <button onClick={() => setShowPostMenu(null)}>Masquer</button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <p className={styles.post_content} onClick={() => router.push(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>{post.content}</p>

                {post.image && (
                  <div className={styles.post_image} onClick={() => router.push(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
                    {post.image.toLowerCase().match(/\.(mp4|mov|webm)$/) ? (
                      <video src={post.image} controls style={{ width: '100%', borderRadius: '12px' }} />
                    ) : (
                      <img src={post.image} alt="Post" />
                    )}
                  </div>
                )}

                {post.tags?.length > 0 && (
                  <div className={styles.post_tags}>
                    {post.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="majorelle"
                        size="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setActiveTag(tag); setActiveFilter('all'); }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className={styles.post_actions}>
                  <button
                    className={`${styles.post_action} ${post.liked ? styles.post_action_liked : ''}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart size={20} fill={post.liked ? 'var(--rose)' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    className={styles.post_action}
                    onClick={() => {
                      if (!user) return setShowAuthTeaser('comment');
                      if (!post.comments_disabled) setActivePostComments(activePostComments === post.id ? null : post.id);
                    }}
                    style={{ opacity: post.comments_disabled ? 0.5 : 1, cursor: post.comments_disabled ? 'not-allowed' : 'pointer' }}
                  >
                    <MessageCircle size={20} />
                    <span>{post.comments_disabled ? 'Off' : post.comments}</span>
                  </button>
                  <button className={styles.post_action} onClick={() => handleShare(post)}>
                    <Share2 size={20} />
                    <span>{post.shares || 0}</span>
                  </button>
                  <button
                    className={`${styles.post_action} ${savedPosts.includes(post.id) ? styles.post_action_saved : ''}`}
                    onClick={() => toggleSave(post.id)}
                  >
                    <Bookmark size={20} fill={savedPosts.includes(post.id) ? 'var(--majorelle)' : 'none'} />
                  </button>
                </div>

                {post.comments_data?.length > 0 && activePostComments !== post.id && (
                  <div className={styles.comments_preview} style={{ padding: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {post.comments_data.slice(0, 2).map(c => (
                      <div key={c.id} style={{ fontSize: '0.85rem', color: '#555' }}>
                        <Link href={`/profile/${c.userId}`} style={{ fontWeight: '600', textDecoration: 'none', color: 'inherit', marginRight: '5px' }}>
                          {c.user}
                        </Link>
                        {c.content}
                      </div>
                    ))}
                    {post.comments_data.length > 2 && (
                      <button
                        onClick={() => setActivePostComments(post.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--majorelle)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                      >
                        Voir les {post.comments_data.length} commentaires
                      </button>
                    )}
                  </div>
                )}

                {activePostComments === post.id && (
                  <div className={styles.comment_section} style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <div className={styles.comments_expanded} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {post.comments_data?.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                          <Avatar src={c.avatar} size="xs" />
                          <div style={{ flex: 1 }}>
                            <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: '15px' }}>
                              <Link href={`/profile/${c.userId}`} style={{ fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '2px' }}>
                                {c.user}
                              </Link>
                              <span style={{ fontSize: '0.85rem' }}>{c.content}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.comment_input_box} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Avatar src={profile?.avatar_url} size="xs" />
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Ajouter un commentaire..."
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText.trim()}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--majorelle)', cursor: 'pointer' }}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className={styles.modal_overlay} onClick={() => setShowShareModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>🔗 Partager cette publication</h3>
            <p>Le lien unique vers cette aventure :</p>
            <div className={styles.share_link_box}>
              <code>{`${window.location.origin}/post/${showShareModal.id}`}</code>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${showShareModal.id}`);
                alert('Lien copié !');
              }}>Copier</button>
            </div>
            <Button variant="ghost" fullWidth onClick={() => setShowShareModal(null)} style={{ marginTop: '1rem' }}>Fermer</Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={styles.feed_sidebar}>
        <div className={styles.sidebar_card}>
          <h3>🔥 Tendances</h3>
          <div className={styles.trending}>
            {trends.length > 0 ? trends.map((item, i) => (
              <div key={i} className={styles.trending_item} onClick={() => { setActiveTag(item.tag.replace('#', '')); setActiveFilter('all'); }} style={{ cursor: 'pointer' }}>
                <span className={styles.trending_tag}>{item.tag}</span>
                <span className={styles.trending_count}>{item.count} posts</span>
              </div>
            )) : (
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Aucune tendance.</p>
            )}
          </div>
        </div>
      </aside>

      {/* Story Upload Modal */}
      {showStoryUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowStoryUpload(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>📸 Ajouter une Story</h2>
            <input
              type="text" placeholder="📍 Ajouter une localisation (optionnel)"
              value={storyLocation} onChange={e => setStoryLocation(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '1rem', fontSize: '0.95rem' }}
            />
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              padding: '2.5rem', border: '2px dashed #ccc', borderRadius: '16px', cursor: 'pointer',
              background: '#fafafa', transition: 'all 0.2s'
            }}>
              {uploadingStory ? (
                <><Loader2 className="spin" size={32} /><span>Téléchargement en cours...</span></>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Camera size={28} style={{ color: 'var(--majorelle)' }} />
                    <Video size={28} style={{ color: 'var(--rose)' }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>Photo ou Vidéo</span>
                  <span style={{ fontSize: '0.85rem', color: '#999' }}>Cliquez pour sélectionner</span>
                </>
              )}
              <input type="file" accept="image/*,video/*" onChange={handleStoryUpload} hidden disabled={uploadingStory} />
            </label>
            <button onClick={() => setShowStoryUpload(false)}
              style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: '#f0f0f0', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Story Viewer Component */}
      {viewingStory && (
        <StoryModal
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
          onEnded={() => {
            const currentIndex = realStories.findIndex(s => s.userId === viewingStory.userId);
            if (currentIndex < realStories.length - 1) {
              setViewingStory(realStories[currentIndex + 1]);
            } else {
              setViewingStory(null);
            }
          }}
        />
      )}

      {/* Auth Teaser Modal for Guests */}
      {showAuthTeaser && (
        <AuthTeaserModal
          action={showAuthTeaser}
          onClose={() => setShowAuthTeaser(null)}
        />
      )}
    </div>
  );
}