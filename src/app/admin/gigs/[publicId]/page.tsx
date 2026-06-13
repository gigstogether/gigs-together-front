import AdminGigDetailBackLink from '@/app/admin/gigs/_components/AdminGigDetailBackLink';
import AdminGigDetailPageClient from '@/app/admin/gigs/AdminGigDetailPageClient';

interface AdminGigDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function AdminGigDetailPage(props: AdminGigDetailPageProps) {
  const { publicId } = await props.params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col sm:mx-0 sm:max-w-none sm:flex-row sm:items-start sm:gap-4">
      <AdminGigDetailBackLink />
      <div className="w-full max-w-md">
        <AdminGigDetailPageClient publicId={publicId} />
      </div>
    </div>
  );
}
