import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';
import { clientEnv } from '@/env/client-env';
import { serverEnv } from '@/env/server-env';
import { countryIsoToTranslationKey } from '@/lib/country-iso-to-translation-key';
import { getFeed } from '@/app/feed/_lib/get-feed.server';
import { gigToEvent } from '@/lib/feed/feed.mapper';
import {
  DEFAULT_FEED_ROUTE,
  normalizeSegment,
  SUPPORTED_FEED_LOCATIONS,
} from '@/lib/feed/feed.routes';
import { I18nProvider } from '@/providers/I18nProvider';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';
import { getTranslations } from '@/lib/translations.server';
import type { Event } from '@/lib/types';

const PAGE_SIZE = clientEnv.feedPageSize;
const EAGER_INITIAL_POSTER_COUNT = serverEnv.eagerInitialPosterCount;

export const dynamicParams = false;
export const revalidate = 60;

export async function generateStaticParams() {
  return SUPPORTED_FEED_LOCATIONS.map((x) => ({ country: x.country, city: x.city }));
}

interface FeedCityRouteParams {
  readonly country: string;
  readonly city: string;
}

interface FeedCityPageProps {
  readonly params: Promise<FeedCityRouteParams>;
}

export default async function Page(props: FeedCityPageProps) {
  const { country, city } = await props.params;
  const normalizedCountry = normalizeSegment(country);
  const normalizedCity = normalizeSegment(city);

  // Currently, we only support one location.
  if (normalizedCountry !== 'es' || normalizedCity !== 'barcelona') {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const [i18n, feed] = await Promise.all([
    getTranslations('en', ['country', 'city']),
    getFeed({ limit: PAGE_SIZE, country, city }),
  ]);

  const tCountry = (iso: string): string => {
    const key = countryIsoToTranslationKey(iso);
    return resolveTranslationValue({
      entry: i18n.translations.country?.[key],
      namespace: 'country',
      key,
    });
  };

  const tCity = (code: string): string =>
    resolveTranslationValue({
      entry: i18n.translations.city?.[code],
      namespace: 'city',
      key: code,
    });

  const initialEvents: Event[] = feed.gigs.map((gig) =>
    gigToEvent(gig, {
      resolveCountryName: (iso) => tCountry(iso),
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
      <FeedClient
        country={country}
        city={city}
        initialEvents={initialEvents}
        initialPrevCursor={feed.prevCursor}
        initialNextCursor={feed.nextCursor}
        eagerPosterIds={eagerPosterIds}
        priorityPosterId={priorityPosterId}
      />
    </I18nProvider>
  );
}
