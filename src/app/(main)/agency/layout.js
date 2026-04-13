'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AgencyLayout({ children }) {
  const { user, profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Loader2 className="spin" size={32} color="var(--majorelle)" />
    </div>;
  }

  if (!user || profile?.role !== 'agency') {
    return null; // The page will handle the redirect if needed
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Global CSS Overrides for Agency Dashboard */}
      <style dangerouslySetInnerHTML={{
        __html: `
        header, nav:not(.agency-sidebar-nav), .bottom-nav { display: none !important; }
        main { padding: 0 !important; max-width: none !important; margin: 0 !important; }
      ` }} />

      {/* Persistent Sidebar Background Layer */}
      <div style={{
        position: 'fixed', left: 0, top: 0, width: '260px', height: '100vh',
        background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)',
        zIndex: 0
      }} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}