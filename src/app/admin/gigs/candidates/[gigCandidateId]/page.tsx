import AdminGigCandidateBackLink from '@/app/admin/gigs/candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateDetailPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient';

interface AdminGigCandidateDetailPageProps {
  params: Promise<{ gigCandidateId: string }>;
}

export default async function AdminGigCandidateDetailPage(props: AdminGigCandidateDetailPageProps) {
  const { gigCandidateId } = await props.params;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <AdminGigCandidateBackLink />
      <AdminGigCandidateDetailPageClient
        mode="view"
        gigCandidateId={gigCandidateId}
      />
    </div>
  );
}
