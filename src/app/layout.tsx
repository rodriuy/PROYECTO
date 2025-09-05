'use client'; // Required for useEffect

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/AuthProvider';
import { LanguageProvider } from '@/context/LanguageProvider';
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';

// Metadata can still be exported from a client component
export const metadata: Metadata = {
  title: 'Tesoros de Artigas',
  description: 'Despertá los tesoros de tu familia en Artigas.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4a5568" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
