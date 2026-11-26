'use client';

import { useState } from 'react';

import SuggestGigCommunitySelection from './SuggestGigCommunitySelection';
import SuggestGigForm from './SuggestGigForm';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

interface SuggestGigPageClientProps {
  communityOptions: CommunityDisplayOption[];
  countries: CountryDisplayOption[];
  description?: string;
}

export default function SuggestGigPageClient(props: SuggestGigPageClientProps) {
  const { communityOptions, countries, description } = props;

  const [initialCommunityId, setInitialCommunityId] = useState<string | null>(() =>
    communityOptions.length === 1 ? communityOptions[0].value : null,
  );

  if (!initialCommunityId) {
    return (
      <SuggestGigCommunitySelection
        communityOptions={communityOptions}
        description={description}
        onSelect={setInitialCommunityId}
      />
    );
  }

  return (
    <SuggestGigForm
      initialCommunityId={initialCommunityId}
      communityOptions={communityOptions}
      countries={countries}
      description={description}
    />
  );
}
