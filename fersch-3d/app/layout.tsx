import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fersch 3D',
  description: 'Service d\'impression 3D professionnel et rapide',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}