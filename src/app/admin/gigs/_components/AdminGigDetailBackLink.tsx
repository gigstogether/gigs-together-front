import Link from 'next/link';

import { ADMIN_GIGS_BASE_PATH } from '@/app/admin/gigs/admin-gig-paths';

interface AdminGigDetailBackLinkProps {
  readonly returnHref?: string | null;
  readonly fallbackHref?: string;
}

export default function AdminGigDetailBackLink(props: AdminGigDetailBackLinkProps) {
  const { returnHref, fallbackHref = ADMIN_GIGS_BASE_PATH } = props;

  const href = returnHref?.trim() || fallbackHref;

  return (
    <Link
      href={href}
      className="mb-4 inline-block shrink-0 text-sm text-muted-foreground hover:text-foreground"
    >
      ← Gigs
    </Link>
  );
}
