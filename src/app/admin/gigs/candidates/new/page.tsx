import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDraftForm from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { I18nProvider } from '@/providers/I18nProvider';

export default async function AdminGigCandidateNewPage() {
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <AdminGigCandidateBackLink />
        <AdminGigCandidateDraftForm countries={countries} />
      </div>
    </I18nProvider>
  );
}
