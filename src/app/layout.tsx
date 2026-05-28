import type { Metadata } from 'next';
import { Orbitron, Inter } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Smart AI Interview System',
  description: 'AI-powered interview practice with facial expression analysis and real-time confidence scoring.',
  keywords: ['AI interview', 'facial expression', 'confidence scoring', 'interview practice'],
  openGraph: {
    title: 'Smart AI Interview System',
    description: 'Practice interviews with real-time AI analysis',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${inter.variable} font-body bg-[#030712] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
