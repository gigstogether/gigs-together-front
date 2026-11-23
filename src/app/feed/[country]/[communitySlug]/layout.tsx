import type { ReactNode } from 'react';

import Header from '@/components/header/Header';
import { HeaderConfigProvider } from '@/app/feed/_providers/HeaderConfigProvider';
import HeaderCalendar from '@/app/feed/_components/HeaderCalendar';
import { DEFAULT_FEED_ROUTE, normalizeSegment } from '@/lib/feed/feed.routes';
import { getCommunityByRoute } from '@/lib/community/community.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';
import { redirect } from 'next/navigation';

interface FeedLayoutRouteParams {
  country: string;
  communitySlug: string;
}

interface FeedLayoutProps {
  children: ReactNode;
  params: Promise<FeedLayoutRouteParams>;
}

export default async function FeedLayout(props: FeedLayoutProps) {
  const { children, params } = props;
  const { country, communitySlug } = await params;
  const normalizedCountry = normalizeSegment(country);
  const normalizedCommunitySlug = normalizeSegment(communitySlug);
  const resolved = await getCommunityByRoute({
    country: normalizedCountry,
    communitySlug: normalizedCommunitySlug,
  });

  if (!resolved) {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const i18n = await getTranslations('en', [resolved.nameTranslationNamespace]);
  const communityName = resolveTranslationValue({
    entry:
      i18n.translations[resolved.nameTranslationNamespace]?.[resolved.community.nameTranslationKey],
    namespace: resolved.nameTranslationNamespace,
    key: resolved.community.nameTranslationKey,
  });

  return (
    <HeaderConfigProvider>
      <Header
        country={normalizedCountry}
        communitySlug={normalizedCommunitySlug}
        communityName={communityName}
      >
        <HeaderCalendar
          country={normalizedCountry}
          communitySlug={normalizedCommunitySlug}
        />
      </Header>
      {children}
    </HeaderConfigProvider>
  );
}
