import 'server-only';

import Image from 'next/image';
import { serverEnv } from '@/env/server-env';
import { buildFeedHeaderHomeRoute } from '@/lib/feed/feed.routes';
import HeaderActions from '@/components/header/HeaderActions';
import type { ReactNode } from 'react';

interface HeaderBadge {
  readonly src: string;
  readonly alt: string;
}

export interface HeaderProps {
  readonly country?: string;
  readonly city?: string;
  readonly children?: ReactNode;
}

function getHeaderBadge(): HeaderBadge | null {
  if (serverEnv.isDevelopment) {
    return {
      src: '/badge-dev.svg',
      alt: 'DEV environment badge',
    };
  }

  if (serverEnv.isStaging) {
    return {
      src: '/badge-stg.svg',
      alt: 'STG environment badge',
    };
  }

  return null;
}

export default function Header(props: HeaderProps) {
  const { country, city, children } = props;

  const badge = getHeaderBadge();
  const homeHref = buildFeedHeaderHomeRoute(country ? { country, city } : undefined);

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
                {badge ? (
                  <Image
                    src={badge.src}
                    alt={badge.alt}
                    width={48}
                    height={22}
                    className="h-4 w-auto shrink-0 sm:h-[18px]"
                  />
                ) : null}
              </a>
            </h1>
          </div>

          <div className="min-w-0 justify-self-center">{children}</div>

          <HeaderActions
            country={country}
            city={city}
          />
        </div>
      </div>
    </header>
  );
}
