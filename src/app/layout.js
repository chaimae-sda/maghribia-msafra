import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'Maghribia Msafra — Voyagez entre femmes marocaines 🇲🇦',
  description: 'Plateforme sécurisée pour les femmes marocaines : voyagez ensemble, partagez l\'hébergement et créez des souvenirs inoubliables au Maroc et dans le monde.',
  keywords: 'voyage, femmes, Maroc, marocaine, voyageuse, hébergement, communauté, sécurité',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={outfit.variable}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
