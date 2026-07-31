'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Route } from 'next';

import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { DEFAULT_FEED_CITY, DEFAULT_FEED_COUNTRY } from '@/lib/feed.routes';

const AdminHeaderNavMenu = dynamic(() => import('@/app/admin/_components/AdminHeaderNavMenu'));
const HeaderCalendar = dynamic(() => import('@/app/_components/HeaderCalendar'));
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'));

export interface AppHeaderClientProps {
  readonly badgeSrc?: string;
  readonly badgeAlt?: string;
  readonly country?: string;
  readonly city?: string;
  readonly showCalendar?: boolean;
  readonly isAdminHeaderNavEnabled?: boolean;
}

export default function AppHeaderClient(props: AppHeaderClientProps) {
  const {
    badgeSrc,
    badgeAlt,
    country = DEFAULT_FEED_COUNTRY,
    city = DEFAULT_FEED_CITY,
    showCalendar = false,
    isAdminHeaderNavEnabled = false,
  } = props;

  const { config } = useHeaderConfig();
  const { authState } = useTelegramAuth();
  const shouldShowAdminHeaderNav = isAdminHeaderNavEnabled && authState?.isAdmin === true;
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
        {shouldShowAdminHeaderNav ? (
          <AdminHeaderNavMenu />
        ) : showCalendar ? (
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
