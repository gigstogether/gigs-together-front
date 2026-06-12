import Link from 'next/link';

import GigFormClient from '@/app/gig-form/GigFormClient';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { I18nProvider } from '@/lib/i18n';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/translations.server';

export default async function AdminGigFormPage() {
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md">
        <Link
          href={GIG_FORM_ADMIN_BASE_PATH}
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Gigs
        </Link>
        {/* TODO: create countries context to prevent prop drilling? */}
        <GigFormClient
          countries={countries}
          successReturnHref={GIG_FORM_ADMIN_BASE_PATH}
        />
      </div>
    </I18nProvider>
  );
}
