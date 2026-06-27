'use client';

import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Share } from 'lucide-react';

import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import type { CopyToastContent } from '@/components/CopyToClipboardButton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ShareMenuProps {
  readonly sharePath: string;
  readonly className?: string;
  readonly copyLinkLabel?: string;
  readonly copiedToast?: CopyToastContent;
  readonly failedToast?: CopyToastContent;
  readonly side?: ComponentProps<typeof PopoverContent>['side'];
  readonly align?: ComponentProps<typeof PopoverContent>['align'];
}

const DEFAULT_COPIED_TOAST: CopyToastContent = {
  title: 'Link copied',
  description: 'Link copied to clipboard.',
};

const DEFAULT_FAILED_TOAST: CopyToastContent = {
  title: 'Could not copy link',
  description: 'Clipboard access is not available.',
};

export function ShareMenu(props: ShareMenuProps) {
  const {
    sharePath,
    className,
    copyLinkLabel = 'Copy link',
    copiedToast = DEFAULT_COPIED_TOAST,
    failedToast = DEFAULT_FAILED_TOAST,
    side = 'bottom',
    align = 'end',
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window == 'undefined') {
      return '';
    }
    return new URL(sharePath, window.location.origin).href;
  }, [sharePath]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7 shrink-0 text-gray-500', className)}
          title="Share"
          aria-label="Share"
        >
          <Share
            className="h-4 w-4"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-1"
        align={align}
        side={side}
      >
        <CopyToClipboardButton
          copyText={shareUrl}
          label={copyLinkLabel}
          ariaLabel={copyLinkLabel}
          title={copyLinkLabel}
          onCopied={() => setIsOpen(false)}
          copiedToast={copiedToast}
          failedToast={failedToast}
        />
      </PopoverContent>
    </Popover>
  );
}
