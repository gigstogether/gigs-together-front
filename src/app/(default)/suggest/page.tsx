import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigFormClient from '@/app/(default)/suggest/_components/SuggestGigFormClient';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getCommunities } from '@/lib/community/community.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';

export default async function SuggestPage() {
  const [countries, communityCatalog] = await Promise.all([getCountries(), getCommunities()]);
  const i18n = await getTranslations('en', [communityCatalog.nameTranslationNamespace]);
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );
  const communityOptions = communityCatalog.communities.map((community) => ({
    value: community.id,
    label: resolveTranslationValue({
      entry:
        i18n.translations[communityCatalog.nameTranslationNamespace]?.[
          community.nameTranslationKey
        ],
      namespace: communityCatalog.nameTranslationNamespace,
      key: community.nameTranslationKey,
    }),
  }));

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
