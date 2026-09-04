import AdminGigCandidateFormPage from '@/app/admin/gigs/candidates/_components/AdminGigCandidateFormPage';

interface AdminGigCandidateEditPageParams {
  gigCandidateId: string;
}

interface AdminGigCandidateEditPageProps {
  params: Promise<AdminGigCandidateEditPageParams>;
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
