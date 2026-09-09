import AdminGigCandidateDetailPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient';

interface AdminGigCandidateDetailPageParams {
  gigCandidateId: string;
}

interface AdminGigCandidateDetailPageProps {
  params: Promise<AdminGigCandidateDetailPageParams>;
}

export default async function AdminGigCandidateDetailPage(props: AdminGigCandidateDetailPageProps) {
  const { gigCandidateId } = await props.params;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <AdminGigCandidateDetailPageClient
        mode="view"
        gigCandidateId={gigCandidateId}
      />
    </div>
  );
}
