import { DEFAULT_LOCALE_ISO } from '@/lib/i18n/locale.constants';
import AdminGigCandidateBackLink from '@/app/admin/gig-candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient';
import AdminGigCandidateForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateForm';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getCommunityDisplayOptions } from '@/lib/community/community-display-options.server';

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
  const [countries, communityOptions] = await Promise.all([
    getCountries(),
    getCommunityDisplayOptions(DEFAULT_LOCALE_ISO),
  ]);
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    DEFAULT_LOCALE_ISO,
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {props.mode === 'create' ? (
        <>
          <AdminGigCandidateBackLink />
          <AdminGigCandidateForm
            countries={countryOptions}
            communityOptions={communityOptions}
          />
        </>
      ) : (
        <AdminGigCandidateDetailPageClient
          mode="edit"
          countries={countryOptions}
          communityOptions={communityOptions}
          gigCandidateId={props.gigCandidateId}
        />
      )}
    </div>
  );
}
