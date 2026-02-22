'use client';

import {
  BookOpen,
  List,
  ShoppingBasket,
  User,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/lists', icon: List, label: 'Lists' },
  { href: '/pantry', icon: ShoppingBasket, label: 'Pantry' },
  { href: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { href: '/recipes', icon: BookOpen, label: 'Recipes' },
  { href: '/budget', icon: Wallet, label: 'Budget' },
  { href: '/settings', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 transition-colors',
                'min-h-[48px] min-w-[64px]', // Touch target size
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
