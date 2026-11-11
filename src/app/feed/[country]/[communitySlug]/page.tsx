import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';
import { clientEnv } from '@/env/client-env';
import { serverEnv } from '@/env/server-env';
import { getFeed } from '@/app/feed/_lib/feed.server';
import { gigToEvent } from '@/lib/feed/feed.mapper';
import { DEFAULT_FEED_ROUTE, buildFeedPath, normalizeSegment } from '@/lib/feed/feed.routes';
import { I18nProvider } from '@/providers/I18nProvider';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';
import { getTranslations } from '@/lib/i18n/translations.server';
import type { Event } from '@/lib/types';
import { createOpenGraphMetadata } from '@/lib/open-graph';
import { getCommunities, getCommunityByRoute } from '@/lib/community/community.server';

const PAGE_SIZE = clientEnv.feedPageSize;
const EAGER_INITIAL_POSTER_COUNT = serverEnv.eagerInitialPosterCount;

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await getCommunities();

  return catalog.communities.map((community) => ({
    country: community.countryIso.toLowerCase(),
    communitySlug: community.slug,
  }));
}

interface FeedCommunityRouteParams {
  country: string;
  communitySlug: string;
}

interface FeedCommunityPageProps {
  params: Promise<FeedCommunityRouteParams>;
}

function getFeedPageTitle(communityName: string): string {
  return `${communityName} | ${serverEnv.brandName}`;
}

export async function generateMetadata(props: FeedCommunityPageProps): Promise<Metadata> {
  const { country, communitySlug } = await props.params;
  const resolved = await getCommunityByRoute({ country, communitySlug });

  if (!resolved) {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const feedPath = buildFeedPath({ country, communitySlug });
  const i18n = await getTranslations('en', [resolved.nameTranslationNamespace]);
  const communityName = resolveTranslationValue({
    entry:
      i18n.translations[resolved.nameTranslationNamespace]?.[resolved.community.nameTranslationKey],
    namespace: resolved.nameTranslationNamespace,
    key: resolved.community.nameTranslationKey,
  });

  return {
    title: {
      absolute: getFeedPageTitle(communityName),
    },
    alternates: {
      canonical: feedPath,
    },
    openGraph: createOpenGraphMetadata({
      url: feedPath,
      title: serverEnv.sitePreviewTitle,
      description: serverEnv.sitePreviewDescription,
    }),
  };
}

export default async function Page(props: FeedCommunityPageProps) {
  const { country, communitySlug } = await props.params;
  const normalizedCountry = normalizeSegment(country);
  const normalizedCommunitySlug = normalizeSegment(communitySlug);
  const resolved = await getCommunityByRoute({
    country: normalizedCountry,
    communitySlug: normalizedCommunitySlug,
  });

  if (!resolved) {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const [i18n, feed] = await Promise.all([
    getTranslations('en', ['city', resolved.nameTranslationNamespace]),
    getFeed({
      limit: PAGE_SIZE,
      country: normalizedCountry,
      communitySlug: normalizedCommunitySlug,
    }),
  ]);

  const tCity = (code: string): string =>
    resolveTranslationValue({
      entry: i18n.translations.city?.[code],
      namespace: 'city',
      key: code,
    });

  const communityName = resolveTranslationValue({
    entry:
      i18n.translations[resolved.nameTranslationNamespace]?.[resolved.community.nameTranslationKey],
    namespace: resolved.nameTranslationNamespace,
    key: resolved.community.nameTranslationKey,
  });
  const pageTitle = getFeedPageTitle(communityName);

  const initialEvents: Event[] = feed.gigs.map((gig) =>
    gigToEvent(gig, {
      resolveCityName: (code) => tCity(code),
    }),
  );

  const initialEventsWithPosters = initialEvents.filter((event) => event.poster);
  const eagerPosterIds = initialEventsWithPosters
    .slice(0, EAGER_INITIAL_POSTER_COUNT)
    .map((event) => event.id);
  const priorityPosterId = initialEventsWithPosters[0]?.id;

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <h1 className="sr-only">{pageTitle}</h1>
      <FeedClient
        country={normalizedCountry}
        communitySlug={normalizedCommunitySlug}
        initialEvents={initialEvents}
        initialPrevCursor={feed.prevCursor}
        initialNextCursor={feed.nextCursor}
        eagerPosterIds={eagerPosterIds}
        priorityPosterId={priorityPosterId}
      />
    </I18nProvider>
  );
}
