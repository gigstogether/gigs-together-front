import AdminGigDetailBackLink from '@/app/admin/gigs/_components/AdminGigDetailBackLink';
import AdminGigDetailPageClient from '@/app/admin/gigs/_components/AdminGigDetailPageClient';

interface AdminGigDetailPageParams {
  publicId: string;
}

interface AdminGigDetailPageProps {
  params: Promise<AdminGigDetailPageParams>;
}

export default async function AdminGigDetailPage(props: AdminGigDetailPageProps) {
  const { publicId } = await props.params;

  return (
    <div className="mx-auto w-full max-w-md">
      <AdminGigDetailBackLink />
      <AdminGigDetailPageClient publicId={publicId} />
    </div>
  );
}
