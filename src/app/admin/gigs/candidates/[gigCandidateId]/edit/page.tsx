import AdminGigCandidateFormPage from '@/app/admin/gigs/candidates/_components/AdminGigCandidateFormPage';

interface AdminGigCandidateEditPageProps {
  params: Promise<{ gigCandidateId: string }>;
}

export default async function AdminGigCandidateEditPage(props: AdminGigCandidateEditPageProps) {
  const { gigCandidateId } = await props.params;
  return (
    <AdminGigCandidateFormPage
      mode="edit"
      gigCandidateId={gigCandidateId}
    />
  );
}
