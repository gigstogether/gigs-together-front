import EditGigFormClient from '@/app/admin/gigs/_components/EditGigFormClient';
import AdminGigDetailBackLink from '@/app/admin/gigs/_components/AdminGigDetailBackLink';
import { getCountries } from '@/lib/countries.server';
import { createCountryDisplayOptions } from '@/lib/i18n/country-display-name';

interface AdminGigFormPageProps {
  gigPublicId: string;
}

export default async function AdminGigFormPage(props: AdminGigFormPageProps) {
  const { gigPublicId } = props;
  const countries = await getCountries();
  const countryOptions = createCountryDisplayOptions(
    countries.map((country) => country.iso),
    'en',
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <AdminGigDetailBackLink />
      {/* TODO: create admin gig form context to prevent prop drilling? */}
      <EditGigFormClient
        countries={countryOptions}
        gigPublicId={gigPublicId}
      />
    </div>
  );
}
