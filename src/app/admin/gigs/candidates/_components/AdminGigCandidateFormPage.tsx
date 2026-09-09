import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient';
import AdminGigCandidateDraftForm from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { I18nProvider } from '@/providers/I18nProvider';

interface AdminGigCandidateCreateFormPageProps {
  mode: 'create';
}

interface AdminGigCandidateEditFormPageProps {
  mode: 'edit';
  gigCandidateId: string;
}

type AdminGigCandidateFormPageProps =
  | AdminGigCandidateCreateFormPageProps
  | AdminGigCandidateEditFormPageProps;

export default async function AdminGigCandidateFormPage(props: AdminGigCandidateFormPageProps) {
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        {props.mode === 'create' ? (
          <>
            <AdminGigCandidateBackLink />
            <AdminGigCandidateDraftForm countries={countries} />
          </>
        ) : (
          <AdminGigCandidateDetailPageClient
            mode="edit"
            countries={countries}
            gigCandidateId={props.gigCandidateId}
          />
        )}
      </div>
    </I18nProvider>
  );
}
