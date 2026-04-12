import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import styles from './layout.module.css';

export default function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
