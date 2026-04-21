'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  MessageSquare,
  BookText,
  Sparkles,
  Compass,
  User,
  LifeBuoy,
  Search,
  Plus,
  Wind,
  Leaf,
  Timer,
  Heart,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <Command
          shouldFilter
          className="[&_[cmdk-input]]:h-14 [&_[cmdk-input]]:w-full [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:px-4 [&_[cmdk-input]]:text-base [&_[cmdk-input]]:outline-none [&_[cmdk-input]]:placeholder:text-[color:var(--color-fg-subtle)]"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4">
            <Search className="h-4 w-4 text-[color:var(--color-fg-subtle)]" />
            <Command.Input placeholder="Search pages, tools or actions…" />
          </div>

          <Command.List className="max-h-[380px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[color:var(--color-fg-muted)]">
              Nothing matches. Try another term.
            </Command.Empty>

            <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-[color:var(--color-fg-subtle)]">
              <Item icon={LayoutDashboard} label="Dashboard" onSelect={() => go('/dashboard')} />
              <Item icon={MessageSquare} label="Conversations" onSelect={() => go('/chat')} />
              <Item icon={BookText} label="Journal" onSelect={() => go('/journal')} />
              <Item icon={Sparkles} label="Wellness Tools" onSelect={() => go('/tools')} />
              <Item icon={Compass} label="Re-assess" onSelect={() => go('/onboarding')} />
              <Item icon={User} label="Profile" onSelect={() => go('/profile')} />
            </Command.Group>

            <Command.Group heading="Quick actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-[color:var(--color-fg-subtle)]">
              <Item icon={Plus} label="New conversation" onSelect={() => go('/chat?new=1')} />
              <Item icon={Plus} label="New journal entry" onSelect={() => go('/journal?compose=1')} />
              <Item icon={Wind} label="Start breathing exercise" onSelect={() => go('/tools?activity=breathing')} />
              <Item icon={Leaf} label="Grounding 5-4-3-2-1" onSelect={() => go('/tools?activity=grounding')} />
              <Item icon={Timer} label="Focus timer" onSelect={() => go('/tools?activity=focus')} />
              <Item icon={Heart} label="Log mood" onSelect={() => go('/dashboard#mood')} />
            </Command.Group>

            <Command.Group heading="Urgent" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-[color:var(--color-fg-subtle)]">
              <Item
                icon={LifeBuoy}
                label="Crisis SOS — open UK resources"
                onSelect={() => go('/sos')}
                danger
              />
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-[color:var(--color-fg-subtle)]">
            <span>↑ ↓ to navigate · ↵ to select</span>
            <span>esc to close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2.5 text-sm text-[color:var(--color-fg)] aria-selected:bg-white/[0.06] ${
        danger ? 'text-[color:var(--color-danger)] aria-selected:bg-[color:var(--color-danger)]/10' : ''
      }`}
    >
      <Icon className="h-4 w-4 opacity-80" strokeWidth={1.6} />
      <span>{label}</span>
    </Command.Item>
  );
}
