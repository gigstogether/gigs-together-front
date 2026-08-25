import { Suspense } from 'react';

import AdminGigCandidatesPageClient from '@/app/admin/gigs/candidates/_components/AdminGigCandidatesPageClient';

export default function AdminGigCandidatesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <AdminGigCandidatesPageClient />
    </Suspense>
  );
}
