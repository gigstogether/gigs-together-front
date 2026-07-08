import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';
import { getTranslations } from '@/lib/translations.server';
import { I18nProvider } from '@/lib/i18n';
import { getFeed } from '@/lib/feed.server';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';
import { clientEnv } from '@/env/client-env';
import type { Event } from '@/lib/types';
import { gigToEvent } from '@/lib/feed.mapper';
import { DEFAULT_FEED_ROUTE, SUPPORTED_FEED_LOCATIONS } from '@/lib/feed.routes';

const PAGE_SIZE = clientEnv.feedPageSize;

export const dynamicParams = false;
export const revalidate = 60;

export async function generateStaticParams() {
  return SUPPORTED_FEED_LOCATIONS.map((x) => ({ country: x.country, city: x.city }));
}

export default async function Page(props: PageProps<'/feed/[country]/[city]'>) {
  const { country, city } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();
  const normalizedCity = decodeURIComponent(city).trim().toLowerCase();

  // Currently, we only support one location.
  if (normalizedCountry !== 'es' || normalizedCity !== 'barcelona') {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const [i18n, feed] = await Promise.all([
    getTranslations('en', 'country'),
    getFeed({ limit: PAGE_SIZE, country, city }),
  ]);

  const tCountry = (key: string): string =>
    resolveTranslationValue({
      entry: i18n.translations.country?.[key],
      namespace: 'country',
      key,
    });

  const initialEvents: Event[] = feed.gigs.map((gig) =>
    gigToEvent(gig, { resolveCountryName: (iso) => tCountry(iso) }),
  );

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
      />
    </I18nProvider>
  );
}
