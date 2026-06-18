import AdminGigFormPage from '@/app/admin/gigs/_components/AdminGigFormPage';

interface AdminGigEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function AdminGigEditPage(props: AdminGigEditPageProps) {
  const { publicId } = await props.params;
  return (
    <AdminGigFormPage
      mode="edit"
      gigPublicId={publicId}
    />
  );
}
