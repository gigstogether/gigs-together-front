import type { Route } from 'next';

import { ADMIN_GIGS_ROUTE } from '@/lib/admin-gig-paths';
import { ADMIN_GIG_CANDIDATES_ROUTE } from '@/lib/admin-gig-candidate-paths';

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
    href: ADMIN_GIG_CANDIDATES_ROUTE,
    label: 'Gig candidates',
    description: 'Review user-submitted gig candidates',
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
