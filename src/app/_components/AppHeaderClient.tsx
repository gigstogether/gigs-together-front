'use client';

import dynamic from 'next/dynamic';

import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { DEFAULT_FEED_CITY, DEFAULT_FEED_COUNTRY } from '@/lib/feed.routes';

const AdminHeaderNavMenu = dynamic(() => import('@/app/admin/_components/AdminHeaderNavMenu'));
const HeaderCalendar = dynamic(() => import('@/app/_components/HeaderCalendar'));
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'));

export interface AppHeaderClientProps {
  readonly country?: string;
  readonly city?: string;
  readonly showCalendar?: boolean;
  readonly isAdminHeaderNavEnabled?: boolean;
}

export default function AppHeaderClient(props: AppHeaderClientProps) {
  const {
    country = DEFAULT_FEED_COUNTRY,
    city = DEFAULT_FEED_CITY,
    showCalendar = false,
    isAdminHeaderNavEnabled = false,
  } = props;

  const { config } = useHeaderConfig();
  const { authState } = useTelegramAuth();
  const shouldShowAdminHeaderNav = isAdminHeaderNavEnabled && authState?.isAdmin === true;

  return (
    <>
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
