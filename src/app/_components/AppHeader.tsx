import 'server-only';

import { serverEnv } from '@/env/server-env';

import AppHeaderClient from '@/app/_components/AppHeaderClient';

interface HeaderBadge {
  readonly src: string;
  readonly alt: string;
}

export interface AppHeaderProps {
  readonly country?: string;
  readonly city?: string;
  readonly showCalendar?: boolean;
  readonly isAdminHeaderNavEnabled?: boolean;
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

export default function AppHeader(props: AppHeaderProps) {
  const badge = getHeaderBadge();

  return (
    <header
      data-app-header
      className="app-header-mobile-width bg-background fixed top-0 left-0 z-50 h-[45px] w-full border-b"
    >
      <div className="w-full px-4 h-full">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center w-full h-full">
          <AppHeaderClient
            {...props}
            badgeAlt={badge?.alt}
            badgeSrc={badge?.src}
          />
        </div>
      </div>
    </header>
  );
}
