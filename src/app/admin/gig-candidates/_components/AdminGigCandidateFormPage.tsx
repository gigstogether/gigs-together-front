import AdminGigCandidateBackLink from '@/app/admin/gig-candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient';
import AdminGigCandidateDraftForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm';
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
    getCommunityDisplayOptions('en'),
  ]);
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {props.mode === 'create' ? (
        <>
          <AdminGigCandidateBackLink />
          <AdminGigCandidateDraftForm
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
