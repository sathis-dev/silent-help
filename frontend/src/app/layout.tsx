import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { WellnessProvider } from '@/components/wellness/WellnessProvider';

export const metadata: Metadata = {
  title: 'Silent Help AI — Your Compassionate Companion',
  description: 'An intelligent, empathetic AI companion focused on mental wellness and emotional support.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WellnessProvider>
            {children}
          </WellnessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
