import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { WellnessProvider } from '@/components/wellness/WellnessProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Silent Help — Your Compassionate Wellness Companion',
  description: 'An intelligent, empathetic AI companion focused on mental wellness and emotional support. Experience personalized guidance in a safe, private space.',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">
          <WellnessProvider>
            {children}
          </WellnessProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
