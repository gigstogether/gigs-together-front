import { ExternalLink } from 'lucide-react';

import type { AdminGigCandidateOriginalMessage as OriginalMessage } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

interface AdminGigCandidateOriginalMessageProps {
  originalMessage: OriginalMessage;
}

export default function AdminGigCandidateOriginalMessage(
  props: AdminGigCandidateOriginalMessageProps,
) {
  const { originalMessage } = props;

  return (
    <section
      aria-label="Original message"
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Original message:</h3>
        <a
          href={originalMessage.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open original message in Telegram"
          title="Open original message in Telegram"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-primary hover:bg-muted"
        >
          <ExternalLink
            className="h-4 w-4"
            aria-hidden
          />
        </a>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {originalMessage.text}
        </p>
      </div>
    </section>
  );
}
