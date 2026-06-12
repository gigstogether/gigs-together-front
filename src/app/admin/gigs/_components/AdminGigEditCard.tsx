'use client';

import Link from 'next/link';

import GigFormClient from '@/app/gig-form/GigFormClient';
import type { Country } from '@/lib/countries.server';

interface AdminGigEditCardProps {
  readonly countries: Country[];
  readonly gigPublicId: string;
  readonly previewHref: string;
}

export default function AdminGigEditCard(props: AdminGigEditCardProps) {
  const { countries, gigPublicId, previewHref } = props;

  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="shrink-0 border-b px-3 py-2">
        <Link
          href={previewHref}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Preview
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <GigFormClient
          countries={countries}
          mode="edit"
          gigPublicId={gigPublicId}
          successReturnHref={previewHref}
        />
      </div>
    </article>
  );
}
