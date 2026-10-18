import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MirrorFit — Virtual Try-On',
  description:
    'Explore garments and try them on with MirrorFit.',
  keywords: ['virtual dressing room', 'AI try-on', 'fashion', 'boutique', 'luxury'],
  openGraph: {
    title: 'MirrorFit — Virtual Try-On',
    description: 'Explore garments and try them on with MirrorFit.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
