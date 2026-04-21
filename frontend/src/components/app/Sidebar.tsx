'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  BookText,
  Sparkles,
  Compass,
  User,
  LifeBuoy,
  ChevronRight,
  Heart,
  Mail,
  Activity,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import type { EmotionTheme } from '@/lib/emotion-theme';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/chat', icon: MessageSquare, label: 'Conversations' },
  { href: '/journal', icon: BookText, label: 'Journal' },
  { href: '/tools', icon: Sparkles, label: 'Tools' },
  { href: '/gratitude', icon: Heart, label: 'Gratitude' },
  { href: '/letters', icon: Mail, label: 'Letters' },
  { href: '/clinical', icon: Activity, label: 'Check-ins' },
  { href: '/onboarding', icon: Compass, label: 'Re-assess' },
];

interface SidebarProps {
  theme: EmotionTheme;
}

export function Sidebar({ theme }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center border-r border-white/[0.06] bg-[color:var(--color-bg)]/70 backdrop-blur-2xl md:flex">
      <div className="flex h-[76px] w-full items-center justify-center border-b border-white/[0.04]">
        <Link href="/dashboard" aria-label="Silent Help">
          <Logo size={34} />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1 py-6">
        {NAV.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex h-11 w-11 items-center justify-center rounded-xl text-[color:var(--color-fg-muted)] transition-all duration-300',
                    'hover:bg-white/[0.05] hover:text-[color:var(--color-fg)]',
                    active && 'text-[color:var(--color-fg)]',
                  )}
                  style={active ? { background: `${theme.soft}` } : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute -left-[3px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                      style={{ background: theme.gradient }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 pb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/sos"
              className="group flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] transition-all hover:scale-105 hover:border-[color:var(--color-danger)]/40 hover:bg-[color:var(--color-danger)]/20"
            >
              <LifeBuoy className="h-5 w-5" strokeWidth={1.8} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Crisis SOS</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/profile"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl text-[color:var(--color-fg-muted)] transition-all',
                'hover:bg-white/[0.05] hover:text-[color:var(--color-fg)]',
                pathname.startsWith('/profile') && 'bg-white/[0.05] text-[color:var(--color-fg)]',
              )}
            >
              <User className="h-5 w-5" strokeWidth={1.6} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Profile</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

export function MobileNav({ theme }: SidebarProps) {
  const pathname = usePathname();
  const items = [...NAV, { href: '/profile', icon: User, label: 'Profile' }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/[0.06] bg-[color:var(--color-bg)]/80 px-2 py-2 backdrop-blur-2xl md:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-medium uppercase tracking-wide transition-colors',
              active ? 'text-[color:var(--color-fg)]' : 'text-[color:var(--color-fg-subtle)]',
            )}
          >
            <item.icon
              className="h-5 w-5"
              style={active ? { color: theme.accent } : undefined}
              strokeWidth={active ? 2 : 1.6}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export { ChevronRight };
