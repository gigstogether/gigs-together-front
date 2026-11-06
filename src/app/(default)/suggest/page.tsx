import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigFormClient from '@/app/(default)/suggest/_components/SuggestGigFormClient';
import { getTranslations } from '@/lib/i18n/translations.server';
import { getCountries } from '@/lib/countries.server';
import { I18nProvider } from '@/providers/I18nProvider';
import { getRequiredCommunityByRoute } from '@/lib/community/community.server';
import { DEFAULT_FEED_COMMUNITY_SLUG, DEFAULT_FEED_COUNTRY } from '@/lib/feed/feed.routes';

export default async function SuggestPage() {
  const [countries, i18n, resolvedCommunity] = await Promise.all([
    getCountries(),
    getTranslations('en', 'country'),
    getRequiredCommunityByRoute({
      country: DEFAULT_FEED_COUNTRY,
      communitySlug: DEFAULT_FEED_COMMUNITY_SLUG,
    }),
  ]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
        <SuggestAuthGate>
          <SuggestGigFormClient
            communityId={resolvedCommunity.community.id}
            countries={countries}
          />
        </SuggestAuthGate>
      </div>
    </I18nProvider>
  );
}
