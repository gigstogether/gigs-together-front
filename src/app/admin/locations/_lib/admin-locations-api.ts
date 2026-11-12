import { z } from 'zod';

import { apiClientRequest } from '@/lib/api-session-client';

const V1_ADMIN_LOCALITIES_ENDPOINT = 'v1/admin/localities';
const V1_ADMIN_PLACES_ENDPOINT = 'v1/admin/places';

const adminLocalitySchema = z
  .object({
    id: z.string().min(1),
    countryIso: z.string().length(2),
    name: z.string().min(1),
    qualifier: z.string().min(1).optional(),
    aliases: z.array(z.string().min(1)),
    timeZone: z.string().min(1),
  })
  .strict();

const adminLocalitiesResponseSchema = z
  .object({
    localities: z.array(adminLocalitySchema),
  })
  .strict();

const adminPlaceSchema = z
  .object({
    id: z.string().min(1),
    localityId: z.string().min(1),
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)),
    isActive: z.boolean(),
  })
  .strict();

const adminPlacesResponseSchema = z
  .object({
    places: z.array(adminPlaceSchema),
  })
  .strict();

export type AdminLocality = z.infer<typeof adminLocalitySchema>;
export type AdminPlace = z.infer<typeof adminPlaceSchema>;

export interface CreateAdminLocalityBody {
  countryIso: string;
  name: string;
  qualifier?: string;
  aliases: string[];
  timeZone: string;
}

export interface UpdateAdminLocalityBody {
  name: string;
  qualifier: string | null;
  aliases: string[];
  timeZone: string;
}

export interface CreateAdminPlaceBody {
  localityId: string;
  name: string;
  aliases: string[];
  isActive: boolean;
}

export interface UpdateAdminPlaceBody {
  name: string;
  aliases: string[];
  isActive: boolean;
}

export async function fetchAdminLocalities(): Promise<AdminLocality[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_LOCALITIES_ENDPOINT, 'GET');
  return adminLocalitiesResponseSchema.parse(raw).localities;
}

export async function createAdminLocality(body: CreateAdminLocalityBody): Promise<AdminLocality> {
  const raw = await apiClientRequest<unknown, CreateAdminLocalityBody>(
    V1_ADMIN_LOCALITIES_ENDPOINT,
    'POST',
    body,
  );
  return adminLocalitySchema.parse(raw);
}

export async function updateAdminLocality(
  id: string,
  body: UpdateAdminLocalityBody,
): Promise<AdminLocality> {
  const raw = await apiClientRequest<unknown, UpdateAdminLocalityBody>(
    `${V1_ADMIN_LOCALITIES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PATCH',
    body,
  );
  return adminLocalitySchema.parse(raw);
}

export function deleteAdminLocality(id: string): Promise<void> {
  return apiClientRequest<void>(
    `${V1_ADMIN_LOCALITIES_ENDPOINT}/${encodeURIComponent(id)}`,
    'DELETE',
  );
}

export async function fetchAdminPlaces(): Promise<AdminPlace[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_PLACES_ENDPOINT, 'GET');
  return adminPlacesResponseSchema.parse(raw).places;
}

export async function createAdminPlace(body: CreateAdminPlaceBody): Promise<AdminPlace> {
  const raw = await apiClientRequest<unknown, CreateAdminPlaceBody>(
    V1_ADMIN_PLACES_ENDPOINT,
    'POST',
    body,
  );
  return adminPlaceSchema.parse(raw);
}

export async function updateAdminPlace(
  id: string,
  body: UpdateAdminPlaceBody,
): Promise<AdminPlace> {
  const raw = await apiClientRequest<unknown, UpdateAdminPlaceBody>(
    `${V1_ADMIN_PLACES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PATCH',
    body,
  );
  return adminPlaceSchema.parse(raw);
}

export function deleteAdminPlace(id: string): Promise<void> {
  return apiClientRequest<void>(`${V1_ADMIN_PLACES_ENDPOINT}/${encodeURIComponent(id)}`, 'DELETE');
}
