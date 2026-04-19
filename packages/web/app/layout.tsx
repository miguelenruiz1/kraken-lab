import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kraken Lab — AI Feature Studio',
  description: 'Genera archivos .feature en dialecto Kraken desde lenguaje natural.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
