'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Users, MessageCircle, Calendar, ShoppingBag, User, Search, Bell, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/feed', label: 'Fil', icon: Home },
  { href: '/hosting', label: 'Hébergement', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/events', label: 'Événements', icon: Calendar },
  { href: '/shop', label: 'Voyages', icon: ShoppingBag },
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navbar_inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logo_icon}>
            <img src="/logo.png" alt="Maghribia Msafra" width={48} height={48} />
          </div>
          <span className={styles.logo_text}>
            Maghribia <span className={styles.logo_accent}>Msafra</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav_desktop}>
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.nav_link} ${active ? styles.nav_link_active : ''}`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className={styles.nav_right}>
          <button className={styles.icon_btn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Rechercher">
            <Search size={20} />
          </button>
          <button className={styles.icon_btn} aria-label="Notifications">
            <Bell size={20} />
            <span className={styles.notification_dot}></span>
          </button>
          <button className={styles.icon_btn} onClick={toggleDark} aria-label="Mode sombre">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link href="/profile" className={styles.profile_btn}>
            <div className={styles.profile_avatar}>
              <span>A</span>
            </div>
          </Link>
          <button
            className={`${styles.icon_btn} ${styles.mobile_menu_btn}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className={styles.search_overlay}>
          <div className={styles.search_container}>
            <Search size={20} className={styles.search_icon} />
            <input
              type="text"
              placeholder="Rechercher une ville, une voyageuse, un événement..."
              className={styles.search_input}
              autoFocus
            />
            <button className={styles.search_close} onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobile_overlay} onClick={() => setMobileMenuOpen(false)}>
          <nav className={styles.mobile_menu} onClick={e => e.stopPropagation()}>
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobile_link} ${active ? styles.mobile_link_active : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={22} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
