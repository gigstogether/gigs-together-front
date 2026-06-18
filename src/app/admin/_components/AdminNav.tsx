'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminNavItems } from '@/app/admin/admin-nav-config';
import { cn } from '@/lib/utils';

interface AdminNavProps {
  readonly onNavigate?: () => void;
}

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav(props: AdminNavProps) {
  const { onNavigate } = props;
  const pathname = usePathname() ?? '/admin';

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label="Admin navigation"
    >
      {adminNavItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              !item.isEnabled && 'pointer-events-none opacity-50',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
