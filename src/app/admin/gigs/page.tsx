import { Suspense } from 'react';

import AdminGigsPageClient from '@/app/admin/gigs/AdminGigsPageClient';
import { I18nProvider } from '@/lib/i18n';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/translations.server';

export default async function AdminGigsPage() {
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <AdminGigsPageClient countries={countries} />
      </Suspense>
    </I18nProvider>
  );
}
