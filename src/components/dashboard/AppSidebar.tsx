'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Upload, Bot, Nfc, User, Settings, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { MateIcon } from '../icons/MateIcon';
import { SolIcon } from '../icons/SolIcon';
import { TeroIcon } from '../icons/TeroIcon';

const menuItems = [
  { href: '/dashboard', icon: Home, labelKey: 'sidebar_explore' },
  { href: '/dashboard/upload', icon: Upload, labelKey: 'sidebar_upload' },
  { href: '/dashboard/avatar', icon: Bot, labelKey: 'sidebar_avatar' },
  { href: '/dashboard/simulation', icon: Nfc, labelKey: 'sidebar_simulation' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <MateIcon className="w-8 h-8 text-accent" />
          <span className="text-xl font-headline font-bold text-foreground">
            Artigas Treasures
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: t(item.labelKey as any), side: 'right' }}
                >
                  <item.icon />
                  <span>{t(item.labelKey as any)}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: t('sidebar_settings'), side: 'right' }}>
                    <Settings/>
                    <span>{t('sidebar_settings')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton tooltip={{ children: t('sidebar_logout'), side: 'right' }}>
                    <LogOut/>
                    <span>{t('sidebar_logout')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
