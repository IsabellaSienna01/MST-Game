import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MST Game',
  description: 'MST Simulator — Prim-Jarník & Kruskal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
