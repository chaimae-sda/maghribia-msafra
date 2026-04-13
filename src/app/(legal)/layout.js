'use client';

import Navbar from '@/components/layout/Navbar';
import styles from './legal.module.css';

export default function LegalLayout({ children }) {
  return (
    <div className={styles.legal_page}>
      <Navbar />
      <main className={styles.legal_content}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      
      <footer className={styles.simple_footer}>
        <div className={styles.container}>
          <p>© 2024 Maghribia Msafra. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
