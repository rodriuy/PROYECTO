'use client';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

export function LanguageToggle() {
  const { language, toggleLanguage } = useTranslation();

  const handleToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    toggleLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="text-white hover:bg-white/10 hover:text-white"
    >
      {language === 'es' ? 'EN' : 'ES'}
    </Button>
  );
}
