'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  User,
} from 'firebase/auth';
import { auth, analytics } from '@/lib/firebase';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { logEvent } from 'firebase/analytics';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAnonLoading, setIsAnonLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleAuthError = (error: any) => {
    console.error(error);
    let errorMessage = 'An unexpected error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid credentials. Please try again.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak. Please use at least 6 characters.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            default:
                errorMessage = 'Authentication failed. Please try again later.';
        }
    }
    toast({
      title: 'Authentication Error',
      description: errorMessage,
      variant: 'destructive',
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        if (analytics) logEvent(analytics, 'login', { method: 'password' });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        if (analytics) logEvent(analytics, 'sign_up', { method: 'password' });
      }
      toast({ title: 'Success!', description: "You're now logged in." });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (analytics) logEvent(analytics, 'login', { method: 'google' });
      toast({ title: 'Success!', description: "You're now logged in with Google." });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsAnonLoading(true);
    try {
      await signInAnonymously(auth);
      if (analytics) logEvent(analytics, 'login', { method: 'anonymous' });
      toast({ title: 'Welcome, Guest!', description: "You're exploring anonymously." });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsAnonLoading(false);
    }
  };

  if (authLoading || user) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

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
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">{t('email')}</Label>
                <Input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@familia.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">{t('password')}</Label>
                <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('login')}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm">
              {t('dontHaveAccount')}{' '}
              <button onClick={() => setActiveTab('signup')} className="underline">
                {t('signup')}
              </button>
            </p>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">{t('email')}</Label>
                <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@familia.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">{t('password')}</Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signup')}
              </Button>
            </form>
             <p className="mt-4 text-center text-sm">
              {t('alreadyHaveAccount')}{' '}
              <button onClick={() => setActiveTab('login')} className="underline">
                {t('login')}
              </button>
            </p>
          </TabsContent>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'G'}
              <span className="ml-2">{t('loginWithGoogle')}</span>
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleAnonymousSignIn} disabled={isAnonLoading}>
              {isAnonLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Explorar como invitado
            </Button>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}
