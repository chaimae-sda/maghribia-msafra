import styles from './Card.module.css';

export default function Card({ children, variant = 'default', hover = true, padding = true, className = '', onClick, ...props }) {
  const classes = [
    styles.card,
    styles[`card_${variant}`],
    hover ? styles.card_hover : '',
    padding ? styles.card_padded : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
