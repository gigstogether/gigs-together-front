import AdminGigCandidateCard from '@/app/admin/gig-candidates/_components/AdminGigCandidateCard';
import type { AdminGigCandidate } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

interface AdminGigCandidatePreviewCardProps {
  gigCandidate: AdminGigCandidate | null;
}

export default function AdminGigCandidatePreviewCard(props: AdminGigCandidatePreviewCardProps) {
  if (!props.gigCandidate) {
    return (
      <div className="flex h-full min-h-[12rem] flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Select a Gig Candidate from the list
      </div>
    );
  }

  return <AdminGigCandidateCard gigCandidate={props.gigCandidate} />;
}
