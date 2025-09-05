'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';

export function AuthForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle Firebase auth here.
    // On success, navigate to the dashboard.
    router.push('/dashboard');
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-white/20 text-card-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">{t('email')}</Label>
                <Input id="email-login" type="email" placeholder="juan@familia.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">{t('password')}</Label>
                <Input id="password-login" type="password" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {t('login')}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              {t('loginWithGoogle')}
            </Button>
            <p className="mt-4 text-center text-sm">
              {t('dontHaveAccount')}{' '}
              <button onClick={() => setActiveTab('signup')} className="underline text-accent">
                {t('signup')}
              </button>
            </p>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">{t('email')}</Label>
                <Input id="email-signup" type="email" placeholder="juan@familia.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">{t('password')}</Label>
                <Input id="password-signup" type="password" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {t('signup')}
              </Button>
            </form>
             <p className="mt-4 text-center text-sm">
              {t('alreadyHaveAccount')}{' '}
              <button onClick={() => setActiveTab('login')} className="underline text-accent">
                {t('login')}
              </button>
            </p>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
