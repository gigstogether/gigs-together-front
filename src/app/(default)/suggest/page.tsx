import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';
import SuggestGigFormClient from '@/app/(default)/suggest/_components/SuggestGigFormClient';
import { getTranslations } from '@/lib/i18n/translations.server';
import { getCountries } from '@/lib/countries.server';
import { I18nProvider } from '@/providers/I18nProvider';

export default async function SuggestPage() {
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
        <SuggestAuthGate>
          <SuggestGigFormClient countries={countries} />
        </SuggestAuthGate>
      </div>
    </I18nProvider>
  );
}
