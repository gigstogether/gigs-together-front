import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import {
  fetchAdminLocalities,
  fetchAdminVenues,
} from '@/app/admin/locations/_lib/admin-locations-api';
import type { AdminLocality, AdminVenue } from '@/app/admin/locations/_lib/admin-locations-api';
import type { SelectOption } from '@/components/Select';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

export interface UseAdminLocationCatalogParams {
  countries: CountryDisplayOption[];
  countryIso: string;
  localityId: string;
  selectedVenueIds: string[];
}

export interface UseAdminLocationCatalogResult {
  localitiesQuery: UseQueryResult<AdminLocality[], Error>;
  venuesQuery: UseQueryResult<AdminVenue[], Error>;
  localities: AdminLocality[];
  venues: AdminVenue[];
  countryOptions: SelectOption[];
  localityOptions: SelectOption[];
  venueOptions: SelectOption[];
}

export function useAdminLocationCatalog(
  params: UseAdminLocationCatalogParams,
): UseAdminLocationCatalogResult {
  const { countries, countryIso, localityId, selectedVenueIds } = params;

  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const venuesQuery = useQuery({
    queryKey: adminKeys.venues(),
    queryFn: fetchAdminVenues,
  });
  const localities = localitiesQuery.data ?? [];
  const venues = venuesQuery.data ?? [];
  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: country.name,
  }));
  const localityOptions = localities
    .filter((locality) => locality.countryIso === countryIso)
    .map((locality) => ({
      value: locality.id,
      label:
        locality.qualifier === undefined
          ? locality.name
          : `${locality.name} (${locality.qualifier})`,
    }));
  const venueOptions = venues
    .filter(
      (venue) =>
        venue.localityId === localityId && (venue.isActive || selectedVenueIds.includes(venue.id)),
    )
    .map((venue) => ({ value: venue.id, label: venue.name }));

  return {
    localitiesQuery,
    venuesQuery,
    localities,
    venues,
    countryOptions,
    localityOptions,
    venueOptions,
  };
}
