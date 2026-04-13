'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

export default function StoryModal({ storyGroup, onEnded, onClose }) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  
  // Current active story in the group
  const [index, setIndex] = useState(0);
  const currentStory = storyGroup.stories[index];

  useEffect(() => {
    if (!storyGroup) return;

    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 100;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [index, storyGroup]);

  function nextStory() {
    if (index < storyGroup.stories.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      onEnded ? onEnded() : onClose();
    }
  }

  function prevStory() {
    if (index > 0) {
      setIndex(prev => prev - 1);
      setProgress(0);
    }
  }

  if (!storyGroup) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      
      {/* Progress bars */}
      <div style={{ 
        position: 'absolute', top: '12px', left: '12px', right: '12px', 
        display: 'flex', gap: '4px', zIndex: 20 
      }}>
        {storyGroup.stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', background: '#fff', 
              width: i < index ? '100%' : i === index ? `${progress}%` : '0%',
              transition: i === index ? 'none' : 'width 0.1s linear'
            }} />
          </div>
        ))}
      </div>

      {/* User info */}
      <div 
        style={{ position: 'absolute', top: '24px', left: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', zIndex: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <Avatar src={storyGroup.userAvatar} alt={storyGroup.userName} size="sm" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{storyGroup.userName}</span>
          {currentStory?.location && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={10} /> {currentStory.location}
            </span>
          )}
        </div>
      </div>

      {/* Close button */}
      <button onClick={onClose}
        style={{ position: 'absolute', top: '20px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
        <X size={24} />
      </button>

      {/* Navigation Areas */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}>
        <div onClick={(e) => { e.stopPropagation(); prevStory(); }} style={{ flex: 1, cursor: 'pointer' }} />
        <div onClick={(e) => { e.stopPropagation(); nextStory(); }} style={{ flex: 1, cursor: 'pointer' }} />
      </div>

      {/* Media */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }} onClick={e => e.stopPropagation()}>
        {currentStory?.media_url?.toLowerCase().match(/\.(mp4|mov|webm)$/) ? (
          <video src={currentStory.media_url} autoPlay muted playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', objectFit: 'contain' }} />
        ) : (
          <img src={currentStory?.media_url} alt="Story"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px' }} />
        )}
      </div>
    </div>
  );
}
