import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { I18nProvider } from '@/providers/I18nProvider';

interface AdminGigCandidateEditPageProps {
  params: Promise<{ gigCandidateId: string }>;
}

export default async function AdminGigCandidateEditPage(props: AdminGigCandidateEditPageProps) {
  const { gigCandidateId } = await props.params;
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <AdminGigCandidateBackLink />
        <AdminGigCandidateDetailPageClient
          mode="edit"
          countries={countries}
          gigCandidateId={gigCandidateId}
        />
      </div>
    </I18nProvider>
  );
}
