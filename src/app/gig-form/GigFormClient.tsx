'use client';

import CreateGigFormClient from '@/app/gig-form/CreateGigFormClient';
import EditGigFormClient from '@/app/gig-form/EditGigFormClient';
import type { Country } from '@/lib/countries.server';

interface GigFormClientProps {
  countries: Country[];
  mode?: 'create' | 'edit';
  gigPublicId?: string;
  /** Navigate here after a successful edit instead of `router.back()`. */
  successReturnHref?: string;
}

export default function GigFormClient(props: GigFormClientProps) {
  const { countries, mode = 'create', gigPublicId } = props;

  if (mode === 'edit') {
    if (!gigPublicId) {
      return <div className="p-4 text-sm text-red-600">Missing gigPublicId</div>;
    }
    return (
      <EditGigFormClient
        countries={countries}
        gigPublicId={gigPublicId}
      />
    );
  }

  return <CreateGigFormClient countries={countries} />;
}
