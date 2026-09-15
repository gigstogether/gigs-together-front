import AdminGigFormPage from '@/app/admin/gigs/_components/AdminGigFormPage';

interface AdminGigEditPageParams {
  publicId: string;
}

interface AdminGigEditPageProps {
  params: Promise<AdminGigEditPageParams>;
}

export default async function AdminGigEditPage(props: AdminGigEditPageProps) {
  const { publicId } = await props.params;
  return <AdminGigFormPage gigPublicId={publicId} />;
}
