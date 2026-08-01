import type { Route } from 'next';

import { ADMIN_GIGS_ROUTE } from '@/app/admin/gigs/_lib/admin-gig-paths';

export interface AdminNavItem {
  readonly href: Route;
  readonly label: string;
  readonly description: string;
  readonly isEnabled: boolean;
}

const ADMIN_DASHBOARD_ROUTE: Route = '/admin';
const ADMIN_TRANSLATIONS_ROUTE: Route = '/admin/translations';
const ADMIN_LOCALES_ROUTE: Route = '/admin/locales';
const ADMIN_ADMINS_ROUTE: Route = '/admin/admins';

export const adminNavItems: readonly AdminNavItem[] = [
  {
    href: ADMIN_DASHBOARD_ROUTE,
    label: 'Dashboard',
    description: 'Overview and quick links',
    isEnabled: true,
  },
  {
    href: ADMIN_GIGS_ROUTE,
    label: 'Gigs',
    description: 'Create, edit, and moderate gigs',
    isEnabled: true,
  },
  {
    href: ADMIN_TRANSLATIONS_ROUTE,
    label: 'Translations',
    description: 'UI text and Telegram post strings',
    isEnabled: true,
  },
  {
    href: ADMIN_LOCALES_ROUTE,
    label: 'Locales',
    description: 'Active locales and ordering',
    isEnabled: true,
  },
  {
    href: ADMIN_ADMINS_ROUTE,
    label: 'Admins',
    description: 'Moderator access',
    isEnabled: true,
  },
];
