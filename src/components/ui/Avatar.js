import styles from './Avatar.module.css';

export default function Avatar({ src, alt, size = 'md', status, badge, hasStory, onClick, className = '' }) {
  const classes = [styles.avatar, styles[`avatar_${size}`], className].filter(Boolean).join(' ');
  
  const initials = alt ? alt.split(' ').map(n => n[0]).join('').substring(0, 2) : '??';
  const bgColor = `hsl(${alt ? alt.charCodeAt(0) * 5 : 0}, 60%, 60%)`;

  const content = (
    <div className={classes} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className={styles.avatar_img} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className={styles.avatar_fallback} style={{ background: bgColor, display: src ? 'none' : 'flex' }}>
        {initials}
      </div>
      {status && (
        <span className={`${styles.avatar_status} ${styles[`avatar_status_${status}`]}`} />
      )}
      {badge && (
        <span className={styles.avatar_badge}>{badge}</span>
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div className={`${styles.story_ring} ${styles[`story_ring_${size}`]}`}>
        {content}
      </div>
    );
  }

  return content;
}
