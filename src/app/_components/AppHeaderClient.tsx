'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';

const DEFAULT_COUNTRY = 'es';
const DEFAULT_CITY = 'barcelona';

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

function isFeedRoute(pathname: string): boolean {
  return pathname === '/feed' || pathname.startsWith('/feed/');
}

const AdminHeaderNavMenu = dynamic(() => import('@/app/admin/_components/AdminHeaderNavMenu'));
const HeaderCalendar = dynamic(() => import('@/app/_components/HeaderCalendar'));
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'));

export interface AppHeaderClientProps {
  badgeSrc?: string;
  badgeAlt?: string;
}

export default function AppHeaderClient(props: AppHeaderClientProps) {
  const { badgeSrc, badgeAlt } = props;

  const pathname = usePathname() ?? '/';
  const { config } = useHeaderConfig();
  const { authState } = useTelegramAuth();
  const isFeed = isFeedRoute(pathname);
  const { country, city } = getLocationFromPath(pathname);
  const showAdminHeaderNav = isAdminRoute(pathname) && authState?.isAdmin === true;
  const homeHref = (city ? `/feed/${country}/${city}` : `/feed/${country}`) as Route;

  return (
    <>
      <div className="min-w-0 justify-self-start">
        <h1 className="text-xl font-semibold whitespace-nowrap">
          <a
            href={homeHref}
            className="inline-flex items-center gap-1.5 cursor-pointer select-none"
            aria-label="Go to home"
            title="Go to home"
          >
            <span className="leading-none">
              Gigs<span className="hidden sm:inline"> Together</span>!
            </span>
            {badgeSrc && badgeAlt ? (
              <Image
                src={badgeSrc}
                alt={badgeAlt}
                width={48}
                height={22}
                className="h-4 w-auto shrink-0 sm:h-[18px]"
              />
            ) : null}
          </a>
        </h1>
      </div>
      <div className="min-w-0 justify-self-center">
        {showAdminHeaderNav ? (
          <AdminHeaderNavMenu />
        ) : isFeed ? (
          <HeaderCalendar
            country={country}
            city={city}
            visibleEventDate={config.earliestEventDate}
            visibleEventDateRange={config.visibleEventDateRange}
            onDayClick={config.onDayClick}
          />
        ) : null}
      </div>
      <HeaderActions
        country={country}
        city={city}
      />
    </>
  );
}
