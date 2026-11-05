import AdminGigCandidateBackLink from '@/app/admin/gig-candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient';
import AdminGigCandidateDraftForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/i18n/translations.server';
import { I18nProvider } from '@/providers/I18nProvider';
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
  const [countries, i18n, resolvedCommunity] = await Promise.all([
    getCountries(),
    getTranslations('en', 'country'),
    getRequiredCommunityByRoute({
      country: DEFAULT_FEED_COUNTRY,
      communitySlug: DEFAULT_FEED_COMMUNITY_SLUG,
    }),
  ]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        {props.mode === 'create' ? (
          <>
            <AdminGigCandidateBackLink />
            <AdminGigCandidateDraftForm
              countries={countries}
              defaultCommunityId={resolvedCommunity.community.id}
            />
          </>
        ) : (
          <AdminGigCandidateDetailPageClient
            mode="edit"
            countries={countries}
            defaultCommunityId={resolvedCommunity.community.id}
            gigCandidateId={props.gigCandidateId}
          />
        )}
      </div>
    </I18nProvider>
  );
}
