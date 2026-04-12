'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, Calendar, ShoppingBag } from 'lucide-react';
import styles from './BottomNav.module.css';

const links = [
  { href: '/feed', label: 'Fil', icon: Home },
  { href: '/hosting', label: 'Hôtes', icon: Users },
  { href: '/messages', label: 'Chat', icon: MessageCircle },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/shop', label: 'Voyages', icon: ShoppingBag },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      {links.map(link => {
        const Icon = link.icon;
        const active = pathname === link.href || pathname?.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.bottomNav_link} ${active ? styles.bottomNav_link_active : ''}`}
          >
            <div className={styles.bottomNav_iconWrap}>
              <Icon size={22} />
              {active && <span className={styles.bottomNav_indicator} />}
            </div>
            <span className={styles.bottomNav_label}>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
