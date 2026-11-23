import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigFormClient from '@/app/(default)/suggest/_components/SuggestGigFormClient';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getCommunityDisplayOptions } from '@/lib/community/community-display-options.server';

export default async function SuggestPage() {
  const [countries, communityOptions] = await Promise.all([
    getCountries(),
    getCommunityDisplayOptions('en'),
  ]);
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
      <SuggestAuthGate>
        <SuggestGigFormClient
          communityOptions={communityOptions}
          countries={countryOptions}
        />
      </SuggestAuthGate>
    </div>
  );
}
