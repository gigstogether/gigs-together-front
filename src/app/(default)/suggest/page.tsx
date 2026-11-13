import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigFormClient from '@/app/(default)/suggest/_components/SuggestGigFormClient';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getRequiredCommunityByRoute } from '@/lib/community/community.server';
import { DEFAULT_FEED_COMMUNITY_SLUG, DEFAULT_FEED_COUNTRY } from '@/lib/feed/feed.routes';

export default async function SuggestPage() {
  const [countries, resolvedCommunity] = await Promise.all([
    getCountries(),
    getRequiredCommunityByRoute({
      country: DEFAULT_FEED_COUNTRY,
      communitySlug: DEFAULT_FEED_COMMUNITY_SLUG,
    }),
  ]);
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
      <SuggestAuthGate>
        <SuggestGigFormClient
          communityId={resolvedCommunity.community.id}
          countries={countryOptions}
        />
      </SuggestAuthGate>
    </div>
  );
}
