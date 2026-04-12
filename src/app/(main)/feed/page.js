'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Image, Send, MoreHorizontal, BadgeCheck, Filter } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { posts, stories } from '@/data/mock/posts';
import styles from './page.module.css';

export default function FeedPage() {
  const [feedPosts, setFeedPosts] = useState(posts);
  const [newPost, setNewPost] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = ['all', 'Marrakech', 'Chefchaouen', 'Fès', 'Essaouira', 'Tanger'];

  const toggleLike = (postId) => {
    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  return (
    <div className={styles.feed}>
      <div className={styles.feed_main}>
        {/* Stories */}
        <section className={styles.stories}>
          <div className={styles.stories_scroll}>
            {/* Add story */}
            <button className={styles.story_add}>
              <div className={styles.story_add_icon}>+</div>
              <span>Ajouter</span>
            </button>
            {stories.map(story => (
              <button key={story.id} className={`${styles.story} ${story.viewed ? styles.story_viewed : ''}`}>
                <div className={styles.story_ring}>
                  <Avatar src={story.userAvatar} alt={story.userName} size="lg" />
                </div>
                <span>{story.userName}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Create Post */}
        <div className={styles.createPost}>
          <div className={styles.createPost_top}>
            <Avatar alt="Amina Benali" size="md" />
            <input
              type="text"
              placeholder="Partagez votre aventure..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              className={styles.createPost_input}
            />
          </div>
          <div className={styles.createPost_bottom}>
            <button className={styles.createPost_action}>
              <Image size={18} />
              <span>Photo</span>
            </button>
            <button className={styles.createPost_action}>
              <MapPin size={18} />
              <span>Lieu</span>
            </button>
            <button className={styles.createPost_submit} disabled={!newPost.trim()}>
              <Send size={16} />
              <span>Publier</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <Filter size={16} />
          {filters.map(f => (
            <button
              key={f}
              className={`${styles.filter_btn} ${activeFilter === f ? styles.filter_btn_active : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' ? 'Tout' : f}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className={styles.posts}>
          {feedPosts
            .filter(p => activeFilter === 'all' || p.city === activeFilter)
            .map(post => (
            <article key={post.id} className={styles.post}>
              <div className={styles.post_header}>
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
                <button className={styles.post_more}>
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className={styles.post_content}>{post.content}</p>

              {post.image && (
                <div className={styles.post_image}>
                  <img src={post.image} alt="Post" />
                </div>
              )}

              <div className={styles.post_tags}>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="majorelle" size="sm">#{tag}</Badge>
                ))}
              </div>

              <div className={styles.post_actions}>
                <button
                  className={`${styles.post_action} ${post.liked ? styles.post_action_liked : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart size={20} fill={post.liked ? 'var(--rose)' : 'none'} />
                  <span>{post.likes}</span>
                </button>
                <button className={styles.post_action}>
                  <MessageCircle size={20} />
                  <span>{post.comments}</span>
                </button>
                <button className={styles.post_action}>
                  <Share2 size={20} />
                  <span>{post.shares}</span>
                </button>
                <button className={`${styles.post_action} ${styles.post_action_save}`}>
                  <Bookmark size={20} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={styles.feed_sidebar}>
        <div className={styles.sidebar_card}>
          <h3>🔥 Tendances</h3>
          <div className={styles.trending}>
            {['#ChefchaouenMagique', '#AtlasRando', '#MarocSoloFemme', '#EssaouiraSurf', '#FèsMédina'].map((tag, i) => (
              <div key={i} className={styles.trending_item}>
                <span className={styles.trending_tag}>{tag}</span>
                <span className={styles.trending_count}>{Math.floor(Math.random() * 200 + 50)} posts</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.sidebar_card}>
          <h3>👋 Suggestions</h3>
          <div className={styles.suggestions}>
            {[
              { name: 'Salma Idrissi', city: 'Fès' },
              { name: 'Yasmine B.', city: 'Essaouira' },
              { name: 'Khadija A.', city: 'Rabat' },
            ].map((u, i) => (
              <div key={i} className={styles.suggestion_item}>
                <Avatar alt={u.name} size="sm" />
                <div className={styles.suggestion_info}>
                  <span className={styles.suggestion_name}>{u.name}</span>
                  <span className={styles.suggestion_city}>{u.city}</span>
                </div>
                <button className={styles.follow_btn}>Suivre</button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
