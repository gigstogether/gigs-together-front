import AdminGigCandidateBackLink from '@/app/admin/gig-candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient';
import AdminGigCandidateDraftForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';
import { getRequiredCommunityByRoute } from '@/lib/community/community.server';
import { DEFAULT_FEED_COMMUNITY_SLUG, DEFAULT_FEED_COUNTRY } from '@/lib/feed/feed.routes';

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
  const [countries, resolvedCommunity] = await Promise.all([
    getCountries(),
    getRequiredCommunityByRoute({
      country: DEFAULT_FEED_COUNTRY,
      communitySlug: DEFAULT_FEED_COMMUNITY_SLUG,
    }),
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
            defaultCommunityId={resolvedCommunity.community.id}
          />
        </>
      ) : (
        <AdminGigCandidateDetailPageClient
          mode="edit"
          countries={countryOptions}
          defaultCommunityId={resolvedCommunity.community.id}
          gigCandidateId={props.gigCandidateId}
        />
      )}
    </div>
  );
}
