'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import Header from '@/app/_components/Header';
import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

const AdminHeaderNavMenu = dynamic(() => import('@/app/admin/_components/AdminHeaderNavMenu'));

const DEFAULT_COUNTRY = 'es';
const DEFAULT_CITY = 'barcelona';

interface AppHeaderProps {
  badgeSrc?: string;
  badgeAlt?: string;
}

function getLocationFromPath(pathname: string): { country: string; city: string } {
  // Expected: /feed/[country]/[city]
  // Also accept: /feed/[country]
  const m = /^\/feed\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  if (!m) return { country: DEFAULT_COUNTRY, city: DEFAULT_CITY };

  const country =
    decodeURIComponent(m[1] ?? '')
      .trim()
      .toLowerCase() || DEFAULT_COUNTRY;
  const city =
    decodeURIComponent(m[2] ?? '')
      .trim()
      .toLowerCase() || DEFAULT_CITY;

  return { country, city };
}

function isAdminRoute(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

// TODO: merge with Header.tsx ?
export default function AppHeader(props: AppHeaderProps) {
  const { badgeSrc, badgeAlt } = props;

  const pathname = usePathname() ?? '/';
  const { config } = useHeaderConfig();
  const { authState } = useTelegramAuth();
  const isFeed = pathname === '/feed' || pathname.startsWith('/feed/');
  const { country, city } = getLocationFromPath(pathname);
  const showAdminHeaderNav = isAdminRoute(pathname) && authState?.isAdmin === true;

  // TODO: showCalendar -> centerContent
  return (
    <Header
      badgeAlt={badgeAlt}
      badgeSrc={badgeSrc}
      country={country}
      city={city}
      showCalendar={isFeed}
      centerContent={showAdminHeaderNav ? <AdminHeaderNavMenu /> : undefined}
      earliestEventDate={config.earliestEventDate}
      visibleEventDateRange={config.visibleEventDateRange}
      availableDates={config.availableDates}
      calendarDatesIsLoading={config.calendarDatesIsLoading}
      calendarDatesIsError={config.calendarDatesIsError}
      calendarDatesError={config.calendarDatesError}
      onDayClick={config.onDayClick}
    />
  );
}
