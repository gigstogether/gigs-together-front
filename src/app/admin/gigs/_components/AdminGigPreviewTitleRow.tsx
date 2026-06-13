'use client';

import { buildAdminGigShareUrl } from '@/app/gig-form/gig-form-paths';
import CopyableTextRow from '@/components/CopyableTextRow';

interface AdminGigPreviewTitleRowProps {
  readonly title: string;
  readonly sharePath: string;
}

export default function AdminGigPreviewTitleRow(props: AdminGigPreviewTitleRowProps) {
  const { title, sharePath } = props;

  const copyText = buildAdminGigShareUrl(window.location.origin, sharePath);

  return (
    <CopyableTextRow
      copyText={copyText}
      copyAriaLabel="Copy link"
      copyTitle="Copy link"
      copiedToast={{
        title: 'Link copied',
        description: 'Gig link copied to clipboard.',
      }}
      failedToast={{
        title: 'Could not copy link',
        description: 'Clipboard access is not available.',
      }}
    >
      <h2 className="text-base font-semibold leading-snug">{title}</h2>
    </CopyableTextRow>
  );
}
