'use client';

import type { ReactNode } from 'react';

import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import type { CopyToastContent } from '@/components/CopyToClipboardButton';

interface CopyableTextRowProps {
  readonly children: ReactNode;
  readonly copyText: string;
  readonly copyAriaLabel?: string;
  readonly copyTitle?: string;
  readonly copiedToast?: CopyToastContent;
  readonly failedToast?: CopyToastContent;
}

export default function CopyableTextRow(props: CopyableTextRowProps) {
  const { children, copyText, copyAriaLabel, copyTitle, copiedToast, failedToast } = props;

  return (
    <div className="relative">
      <CopyToClipboardButton
        copyText={copyText}
        ariaLabel={copyAriaLabel}
        title={copyTitle}
        copiedToast={copiedToast}
        failedToast={failedToast}
        className="absolute right-0 top-0"
      />
      <div className="pr-10">{children}</div>
    </div>
  );
}
