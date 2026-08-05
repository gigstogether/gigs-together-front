'use client';

import CreateGigFormClient from '@/app/admin/gigs/_components/CreateGigFormClient';
import EditGigFormClient from '@/app/admin/gigs/_components/EditGigFormClient';
import type { Country } from '@/app/admin/gigs/_lib/countries.types';

interface GigFormClientProps {
  countries: Country[];
  mode?: 'create' | 'edit';
  gigPublicId?: string;
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
