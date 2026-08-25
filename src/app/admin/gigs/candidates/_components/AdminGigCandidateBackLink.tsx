import Link from 'next/link';

import { ADMIN_GIG_CANDIDATES_ROUTE } from '@/lib/admin-gig-candidate-paths';

export default function AdminGigCandidateBackLink() {
  return (
    <Link
      href={ADMIN_GIG_CANDIDATES_ROUTE}
      className="inline-block text-sm text-muted-foreground hover:text-foreground"
    >
      ← Gig Candidates
    </Link>
  );
}
