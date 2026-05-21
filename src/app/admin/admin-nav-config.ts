export interface AdminNavItem {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly isEnabled: boolean;
}

export const adminNavItems: readonly AdminNavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    description: 'Overview and quick links',
    isEnabled: true,
  },
  {
    href: '/admin/gigs',
    label: 'Events',
    description: 'Create, edit, and moderate gigs',
    isEnabled: true,
  },
  {
    href: '/admin/translations',
    label: 'Translations',
    description: 'UI copy and Telegram post strings',
    isEnabled: true,
  },
  {
    href: '/admin/languages',
    label: 'Languages',
    description: 'Active locales and ordering',
    isEnabled: true,
  },
  {
    href: '/admin/admins',
    label: 'Admins',
    description: 'Moderator access',
    isEnabled: true,
  },
];
