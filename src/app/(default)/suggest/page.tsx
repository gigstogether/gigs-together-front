import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigPageClient from '@/app/(default)/suggest/_components/SuggestGigPageClient';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getCommunityDisplayOptions } from '@/lib/community/community-display-options.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';

const TRANSLATION_NAMESPACE = 'suggest';

export default async function SuggestPage() {
  const [countries, communityOptions, i18n] = await Promise.all([
    getCountries(),
    getCommunityDisplayOptions('en'),
    getTranslations('en', TRANSLATION_NAMESPACE),
  ]);
  const descriptionEntry = i18n.translations[TRANSLATION_NAMESPACE]?.description;
  const description =
    descriptionEntry === undefined
      ? undefined
      : resolveTranslationValue({
          entry: descriptionEntry,
          namespace: TRANSLATION_NAMESPACE,
          key: 'description',
        });
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
      <SuggestAuthGate>
        <SuggestGigPageClient
          communityOptions={communityOptions}
          countries={countryOptions}
          description={description}
        />
      </SuggestAuthGate>
    </div>
  );
}
