'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthForm } from '@/components/auth/AuthForm';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageToggle } from '@/components/dashboard/LanguageToggle';
import { cn } from '@/lib/utils';

const landscapes = [
  { src: 'https://images.unsplash.com/photo-1596746905549-7b333555577a?q=80&w=1920&auto=format&fit=crop', alt: 'Campo uruguayo con ganado' },
  { src: 'https://images.unsplash.com/photo-1542055862-491104953357?q=80&w=1920&auto=format&fit=crop', alt: 'Faro de Cabo Polonio, Rocha' },
  { src: 'https://images.unsplash.com/photo-1619450539191-3c75a024c8c7?q=80&w=1920&auto=format&fit=crop', alt: 'Viñedos en Canelones' },
  { src: 'https://images.unsplash.com/photo-1582336211394-91d1a8f9d854?q=80&w=1920&auto=format&fit=crop', alt: 'Atardecer en el Río de la Plata' },
];

export default function Home() {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % landscapes.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      {landscapes.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          className={cn(
            'object-cover -z-10 brightness-50 transition-opacity duration-1000',
            currentImage === index ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-col items-center justify-center text-center text-white">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-xl shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-shadow-lg animate-fade-in-down">
            {t('welcomeMessage')}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl animate-fade-in-up">
            {t('welcomeSubtitle')}
          </p>
        </div>
        <div className="mt-8 w-full max-w-md animate-fade-in">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
