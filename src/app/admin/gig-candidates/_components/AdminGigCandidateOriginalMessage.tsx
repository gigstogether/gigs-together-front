import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

import type { AdminGigCandidateOriginalMessage as OriginalMessage } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import { ImagePreview } from '@/components/ImagePreview';

interface AdminGigCandidateOriginalMessageProps {
  originalMessage: OriginalMessage;
  disclosure?: AdminGigCandidateOriginalMessageDisclosure;
}

interface AdminGigCandidateOriginalMessageDisclosure {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AdminGigCandidateOriginalMessage(
  props: AdminGigCandidateOriginalMessageProps,
) {
  const { originalMessage, disclosure } = props;

  return (
    <section
      aria-label="Original message"
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Original message:</h3>
        <div className="flex items-center gap-1">
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
          {disclosure !== undefined ? (
            <button
              type="button"
              aria-label={
                disclosure.isExpanded ? 'Collapse original message' : 'Expand original message'
              }
              title={
                disclosure.isExpanded ? 'Collapse original message' : 'Expand original message'
              }
              aria-expanded={disclosure.isExpanded}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={disclosure.onToggle}
            >
              {disclosure.isExpanded ? (
                <ChevronUp
                  className="h-4 w-4"
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4"
                  aria-hidden
                />
              )}
            </button>
          ) : null}
        </div>
      </div>
      {disclosure?.isExpanded !== false ? (
        <div className="space-y-3">
          {originalMessage.imageUrl !== undefined ? (
            <ImagePreview
              src={originalMessage.imageUrl}
              alt="Original suggestion"
              openLabel="Open original suggestion image"
              fit="contain"
              imageClassName="max-h-[32rem]"
            />
          ) : null}
          {originalMessage.text !== undefined ? (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {originalMessage.text}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
