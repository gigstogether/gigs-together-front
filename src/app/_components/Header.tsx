'use client';

import dynamic from 'next/dynamic';
import type { Route } from 'next';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';

const HeaderCalendar = dynamic(() => import('@/app/_components/HeaderCalendar'), { ssr: false });
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'), { ssr: false });

interface HeaderProps {
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date) => void;
  availableDates?: string[]; // formatted as YYYY-MM-DD
  calendarDatesIsLoading?: boolean;
  calendarDatesIsError?: boolean;
  calendarDatesError?: string;
  showCalendar?: boolean;
  showSuggestGig?: boolean;
  country: string;
  city: string;
}

export default function Header(props: HeaderProps) {
  const {
    earliestEventDate,
    visibleEventDateRange,
    onDayClick,
    availableDates,
    calendarDatesIsLoading = true,
    calendarDatesIsError = false,
    calendarDatesError,
    showCalendar = true,
    showSuggestGig = true,
    country,
    city,
  } = props;
  const homeHref = (city ? `/feed/${country}/${city}` : `/feed/${country}`) as Route;

  return (
    <header
      data-app-header
      className="app-header-mobile-width bg-background fixed top-0 left-0 z-50 h-[45px] w-full border-b"
    >
      <div className="w-full px-4 h-full">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center w-full h-full">
          <div className="min-w-0 justify-self-start">
            <h1 className="text-xl font-semibold whitespace-nowrap">
              <a
                href={homeHref}
                className="cursor-pointer select-none"
                aria-label="Go to home"
                title="Go to home"
              >
                Gigs<span className="hidden sm:inline"> Together</span>!
              </a>
            </h1>
          </div>
          <div className="min-w-0 justify-self-center">
            {showCalendar ? (
              <HeaderCalendar
                visibleEventDate={earliestEventDate}
                visibleEventDateRange={visibleEventDateRange}
                onDayClick={onDayClick}
                availableDates={availableDates}
                calendarDatesIsLoading={calendarDatesIsLoading}
                calendarDatesIsError={calendarDatesIsError}
                calendarDatesError={calendarDatesError}
              />
            ) : null}
          </div>
          <HeaderActions
            country={country}
            city={city}
            showSuggestGig={showSuggestGig}
          />
        </div>
      </div>
    </header>
  );
}
