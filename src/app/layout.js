import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'Maghribia Msafra — Voyage au Féminin au Maroc',
  description: 'Plateforme sécurisée de voyage pour les femmes marocaines. Hébergement, événements, communauté.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={outfit.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
