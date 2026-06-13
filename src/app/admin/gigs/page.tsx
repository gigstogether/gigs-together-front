import { Suspense } from 'react';

import AdminGigsPageClient from '@/app/admin/gigs/AdminGigsPageClient';

export default function AdminGigsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <AdminGigsPageClient />
    </Suspense>
  );
}
