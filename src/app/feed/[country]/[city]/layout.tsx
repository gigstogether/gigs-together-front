import type { ReactNode } from 'react';

import Header from '@/components/header/Header';
import { HeaderConfigProvider } from '@/app/feed/_providers/HeaderConfigProvider';
import HeaderCalendar from '@/app/feed/_components/HeaderCalendar';
import { normalizeSegment } from '@/lib/feed/feed.routes';

interface FeedLayoutRouteParams {
  readonly country: string;
  readonly city: string;
}

interface FeedLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<FeedLayoutRouteParams>;
}

export default async function FeedLayout(props: FeedLayoutProps) {
  const { children, params } = props;
  const { country, city } = await params;

  return (
    <HeaderConfigProvider>
      <Header
        country={normalizeSegment(country)}
        city={normalizeSegment(city)}
      >
        <HeaderCalendar
          country={country}
          city={city}
        />
      </Header>
      {children}
    </HeaderConfigProvider>
  );
}
