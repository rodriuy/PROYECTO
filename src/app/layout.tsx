import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { LanguageProvider } from '@/context/LanguageProvider';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Artigas Treasures',
  description: 'Awaken your family\'s treasures in Artigas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={cn('font-body antialiased')}>
          {children}
          <Toaster />
        </body>
      </html>
    </LanguageProvider>
  );
}
