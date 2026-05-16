import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { MarketProvider } from '@/context/market-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal Premium — Imobiliário Portugal & Angola',
  description: 'O ecossistema de inteligência imobiliária transfronteiriça. Propriedades premium selecionadas em Portugal e Angola.',
  keywords: ['imobiliário', 'luxo', 'Portugal', 'Angola', 'Luanda', 'Lisboa', 'imóveis premium'],
  authors: [{ name: 'Portal Premium' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Portal Premium — Imobiliário Portugal & Angola',
    description: 'Ecossistema de inteligência imobiliária transfronteiriça.',
    type: 'website',
    locale: 'pt_PT',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Portal Premium',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3D4A2C',
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className="min-h-screen bg-cream-100 text-foreground antialiased">
        <AuthProvider>
          <MarketProvider defaultMarket="PT">
            {children}
          </MarketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
