import type { Route } from 'next';
import Link from 'next/link';

import { ADMIN_GIGS_ROUTE } from '@/lib/admin-gig-paths';

interface AdminGigDetailBackLinkProps {
  readonly returnHref?: Route | null;
  readonly fallbackHref?: Route;
}

export default function AdminGigDetailBackLink(props: AdminGigDetailBackLinkProps) {
  const { returnHref, fallbackHref = ADMIN_GIGS_ROUTE } = props;

  const href = returnHref ?? fallbackHref;

  return (
    <Link
      href={href}
      className="mb-4 inline-block shrink-0 text-sm text-muted-foreground hover:text-foreground"
    >
      ← Gigs
    </Link>
  );
}
