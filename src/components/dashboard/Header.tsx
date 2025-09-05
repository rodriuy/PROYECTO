'use client';

import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageToggle } from './LanguageToggle';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const getTitle = () => {
    if (pathname.includes('/upload')) return t('uploadTitle');
    if (pathname.includes('/avatar')) return t('avatarTitle');
    if (pathname.includes('/simulation')) return t('simulationTitle');
    return t('exploreTitle');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-headline font-semibold">{getTitle()}</h1>
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
           <LanguageToggle/>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/100" alt="User avatar" />
                <AvatarFallback>JU</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Juan Usuario</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t('sidebar_profile')}</DropdownMenuItem>
            <DropdownMenuItem>{t('sidebar_settings')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href="/" passHref>
              <DropdownMenuItem>{t('sidebar_logout')}</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
