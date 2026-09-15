import Link from 'next/link';

import { GIG_CANDIDATE_STATUS_FILTER_BY_API } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-status';
import type { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { ADMIN_GIG_CANDIDATES_ROUTE } from '@/lib/admin-gig-candidate-paths';

interface AdminGigCandidateBackLinkProps {
  gigCandidateStatus?: GigCandidateStatusAPI;
}

export default function AdminGigCandidateBackLink(props: AdminGigCandidateBackLinkProps) {
  const statusFilter = props.gigCandidateStatus
    ? GIG_CANDIDATE_STATUS_FILTER_BY_API[props.gigCandidateStatus]
    : undefined;

  return (
    <Link
      href={{
        pathname: ADMIN_GIG_CANDIDATES_ROUTE,
        query: statusFilter ? { status: statusFilter } : undefined,
      }}
      className="inline-block text-sm text-muted-foreground hover:text-foreground"
    >
      ← Gig Candidates
    </Link>
  );
}
