'use client';

import Image from 'next/image';
import { AuthForm } from '@/components/auth/AuthForm';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageToggle } from '@/components/dashboard/LanguageToggle';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <Image
        src="https://picsum.photos/1920/1080"
        alt="Uruguayan landscape"
        fill
        className="object-cover -z-10 brightness-50"
        data-ai-hint="Uruguayan landscape"
      />
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-col items-center justify-center text-center text-white">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-shadow-lg">
            {t('welcomeMessage')}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">{t('welcomeSubtitle')}</p>
        </div>
        <div className="mt-8 w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
