import { z } from 'zod';

import { apiPublicRequest } from '@/lib/api-public';

const localitySchema = z
  .object({
    id: z.string().min(1),
    countryIso: z.string().regex(/^[A-Z]{2}$/),
    name: z.string().min(1),
    qualifier: z.string().min(1).optional(),
    timeZone: z.string().min(1),
  })
  .strict();

const localityListResponseSchema = z
  .object({
    localities: z.array(localitySchema),
  })
  .strict();

const venueSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
  })
  .strict();

const venueListResponseSchema = z
  .object({
    locality: localitySchema,
    venues: z.array(venueSchema),
  })
  .strict();

export type PublicLocality = z.infer<typeof localitySchema>;
export type PublicVenue = z.infer<typeof venueSchema>;

export interface PublicLocalityCatalog {
  localities: PublicLocality[];
}

export interface PublicVenueCatalog {
  locality: PublicLocality;
  venues: PublicVenue[];
}

export async function fetchPublicLocalities(countryIso: string): Promise<PublicLocalityCatalog> {
  const search = new URLSearchParams({ countryIso });
  const raw = await apiPublicRequest<unknown>(`/v1/localities?${search.toString()}`, 'GET');

  return localityListResponseSchema.parse(raw);
}

export async function fetchPublicVenues(localityId: string): Promise<PublicVenueCatalog> {
  const search = new URLSearchParams({ localityId });
  const raw = await apiPublicRequest<unknown>(`/v1/venues?${search.toString()}`, 'GET');

  return venueListResponseSchema.parse(raw);
}

export function formatLocalityName(locality: PublicLocality): string {
  return locality.qualifier === undefined
    ? locality.name
    : `${locality.name} (${locality.qualifier})`;
}
