'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { LifeBuoy, LogOut, Search, Settings2, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AmbientPlayerButton } from './AmbientPlayerButton';
import type { EmotionTheme } from '@/lib/emotion-theme';

interface TopBarProps {
  theme: EmotionTheme;
  onOpenCommand: () => void;
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat': 'Conversations',
  '/journal': 'Journal',
  '/tools': 'Wellness Tools',
  '/profile': 'Profile',
  '/onboarding': 'Re-assessment',
  '/sos': 'Crisis SOS',
};

export function TopBar({ theme, onOpenCommand }: TopBarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
    }
  }, []);

  const routeTitle =
    Object.entries(TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Silent Help';
  const initials = (user?.firstName?.[0] ?? user?.username?.[0] ?? 'S').toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between gap-4 border-b border-white/[0.04] bg-[color:var(--color-bg)]/60 px-6 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
            Silent Help
          </div>
          <h1 className="text-lg font-semibold tracking-tight">{routeTitle}</h1>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 border-white/10 bg-white/[0.03]"
          style={{ color: theme.accent, borderColor: `${theme.accent}30` }}
        >
          <span className="text-base leading-none">{theme.icon}</span>
          {theme.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommand}
          className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[color:var(--color-fg-muted)] transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-[color:var(--color-fg)] sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="text-[color:var(--color-fg-subtle)]">Quick actions</span>
          <kbd className="ml-8 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>

        <AmbientPlayerButton accent={theme.accent} />

        <Button
          variant="danger"
          size="sm"
          onClick={() => router.push('/sos')}
          className="hidden sm:inline-flex"
        >
          <LifeBuoy className="h-4 w-4" />
          SOS
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-sm transition-colors hover:border-white/20 hover:bg-white/[0.06]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate text-left sm:inline">
                {user?.firstName || user?.username || 'Guest'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium text-[color:var(--color-fg)]">
                {user?.fullName || user?.firstName || 'Guest'}
              </div>
              <div className="truncate text-xs font-normal">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/onboarding')}>
              <Sparkles className="h-4 w-4" /> Re-assess
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCommand}>
              <Settings2 className="h-4 w-4" /> Quick actions…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut(() => router.push('/'))}
              className="text-[color:var(--color-danger)] focus:text-[color:var(--color-danger)]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
