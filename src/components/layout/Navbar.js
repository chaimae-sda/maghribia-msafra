'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, MessageCircle, Calendar, ShoppingBag, Search, Bell, Menu, X, Moon, Sun, LogOut, Building2, Shield, Compass, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthTeaserModal from '@/components/features/AuthTeaserModal';
import styles from './Navbar.module.css';

const baseLinks = [
  { href: '/feed', label: 'Fil', icon: Home },
  { href: '/hosting', label: 'Hébergement', icon: Users },
  { href: '/voyages', label: 'Voyages', icon: Compass },
  { href: '/sorties', label: 'Sorties', icon: Calendar },
  { href: '/evenements', label: 'Événements', icon: Ticket },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, unreadCount, pendingInvitesCount } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthTeaser, setShowAuthTeaser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setMounted(true);
  }, []);

  const toggleDark = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    const theme = nextMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isAgency = profile?.role === 'agency';

  const navLinks = [
    ...baseLinks,
    ...(isAgency ? [{ href: '/agency', label: 'Dashboard', icon: Building2 }] : []),
  ];

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Utilisatrice';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className={styles.navbar}>
      <div className={styles.navbar_inner}>
        {/* Logo */}
        <Link href={user ? "/feed" : "/"} className={styles.logo}>
          <div className={styles.logo_icon}>
            <img src="/logo.png" alt="Maghribia Msafra" width={64} height={64} />
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
            const isRestricted = !user && ['/hosting', '/messages', '/sorties', '/evenements'].includes(link.href);
            
            return (
              <Link
                key={link.href}
                href={isRestricted ? '#' : link.href}
                className={`${styles.nav_link} ${active ? styles.nav_link_active : ''}`}
                onClick={(e) => {
                  if (isRestricted) {
                    e.preventDefault();
                    setShowAuthTeaser(link.label.toLowerCase());
                  }
                }}
              >
                <Icon size={20} />
                <span>{link.label}</span>
                {link.label === 'Messages' && unreadCount > 0 && (
                  <span className={styles.badge_nav}>{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className={styles.nav_right}>
          <button className={styles.icon_btn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Rechercher">
            <Search size={20} />
          </button>
          <button className={styles.icon_btn} onClick={() => {
            if (!user) return setShowAuthTeaser('notifications');
            router.push('/notifications');
          }} aria-label="Notifications">
            <Bell size={20} />
            {user && pendingInvitesCount > 0 ? (
              <span className={styles.badge_icon}>{pendingInvitesCount}</span>
            ) : user && pendingInvitesCount === 0 && <span className={styles.notification_dot}></span>}
          </button>
          <button className={styles.icon_btn} onClick={toggleDark} aria-label="Mode sombre">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              <Link href="/profile" className={styles.profile_btn}>
                <div className={styles.profile_avatar}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className={styles.profile_avatar_img} />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </Link>
              <button className={styles.icon_btn} onClick={handleSignOut} aria-label="Déconnexion" title="Déconnexion">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.login_btn}>Connexion</Link>
          )}

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
      {/* Auth Teaser Modal */}
      {showAuthTeaser && (
        <AuthTeaserModal 
          action={showAuthTeaser} 
          onClose={() => setShowAuthTeaser(null)} 
        />
      )}
    </header>
  );
}
