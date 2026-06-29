'use client';

import { useMemo } from 'react';
import { Share } from 'lucide-react';

import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import type { CopyToastContent } from '@/components/CopyToClipboardButton';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  readonly sharePath: string;
  readonly className?: string;
  readonly copiedToast?: CopyToastContent;
  readonly failedToast?: CopyToastContent;
}

const DEFAULT_COPIED_TOAST: CopyToastContent = {
  title: 'Link copied',
};

const DEFAULT_FAILED_TOAST: CopyToastContent = {
  title: 'Could not copy link',
  description: 'Clipboard access is not available.',
};

export function ShareButton(props: ShareButtonProps) {
  const {
    sharePath,
    className,
    copiedToast = DEFAULT_COPIED_TOAST,
    failedToast = DEFAULT_FAILED_TOAST,
  } = props;

  const shareUrl = useMemo(() => {
    if (typeof window == 'undefined') {
      return '';
    }
    return new URL(sharePath, window.location.origin).href;
  }, [sharePath]);

  return (
    <CopyToClipboardButton
      icon={Share}
      copyText={shareUrl}
      ariaLabel="Copy link"
      title="Copy link"
      copiedToast={copiedToast}
      failedToast={failedToast}
      className={cn('h-7 w-7 text-gray-500', className)}
    />
  );
}
