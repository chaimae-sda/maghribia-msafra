import styles from './Badge.module.css';

export default function Badge({ children, variant = 'default', size = 'sm', dot, icon, className = '' }) {
  const classes = [
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className={styles.badge_dot} />}
      {icon && <span className={styles.badge_icon}>{icon}</span>}
      {children}
    </span>
  );
}
