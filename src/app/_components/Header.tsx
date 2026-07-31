'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';

const HeaderCalendar = dynamic(() => import('@/app/_components/HeaderCalendar'));
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'));

interface HeaderProps {
  badgeSrc?: string;
  badgeAlt?: string;
  earliestEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date) => void;
  showCalendar?: boolean;
  centerContent?: ReactNode;
  country: string;
  city: string;
}

export default function Header(props: HeaderProps) {
  const {
    badgeSrc,
    badgeAlt,
    earliestEventDate,
    visibleEventDateRange,
    onDayClick,
    showCalendar = true,
    centerContent,
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
            {centerContent ? (
              centerContent
            ) : showCalendar ? (
              <HeaderCalendar
                country={country}
                city={city}
                visibleEventDate={earliestEventDate}
                visibleEventDateRange={visibleEventDateRange}
                onDayClick={onDayClick}
              />
            ) : null}
          </div>
          <HeaderActions
            country={country}
            city={city}
          />
        </div>
      </div>
    </header>
  );
}
