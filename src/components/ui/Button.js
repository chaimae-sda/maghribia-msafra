import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', icon, iconRight, fullWidth, disabled, onClick, className = '', ...props }) {
  const classes = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    fullWidth ? styles.btn_full : '',
    disabled ? styles.btn_disabled : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {icon && <span className={styles.btn_icon}>{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className={styles.btn_iconRight}>{iconRight}</span>}
    </button>
  );
}
