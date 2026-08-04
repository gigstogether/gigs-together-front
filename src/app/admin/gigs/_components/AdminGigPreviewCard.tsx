import type { AdminGigDetail } from '@/app/admin/gigs/_lib/types';
import AdminGigCard from '@/app/admin/gigs/_components/AdminGigCard';

interface AdminGigPreviewCardProps {
  readonly gig: AdminGigDetail | null;
}

export default function AdminGigPreviewCard(props: AdminGigPreviewCardProps) {
  const { gig } = props;

  if (!gig) {
    return (
      <div className="flex h-full min-h-[12rem] flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Select a gig from the list
      </div>
    );
  }

  return <AdminGigCard gig={gig} />;
}
