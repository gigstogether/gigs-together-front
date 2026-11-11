import { z } from 'zod';

import { apiClientRequest } from '@/lib/api-session-client';

const V1_ADMIN_COUNTRIES_ENDPOINT = 'v1/admin/countries';
const V1_ADMIN_COUNTRY_OPTIONS_ENDPOINT = `${V1_ADMIN_COUNTRIES_ENDPOINT}/options`;

const adminCountrySchema = z.object({ iso: z.string().length(2) }).strict();
const adminCountriesResponseSchema = z.object({ countries: z.array(adminCountrySchema) }).strict();
const adminCountryOptionSchema = z
  .object({
    iso: z.string().length(2),
    isConfigured: z.boolean(),
  })
  .strict();
const adminCountryOptionsResponseSchema = z
  .object({ countries: z.array(adminCountryOptionSchema) })
  .strict();

export type AdminCountry = z.infer<typeof adminCountrySchema>;
export type AdminCountryOption = z.infer<typeof adminCountryOptionSchema>;

export interface CreateAdminCountryBody {
  iso: string;
}

export async function fetchAdminCountries(): Promise<AdminCountry[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_COUNTRIES_ENDPOINT, 'GET');

  return adminCountriesResponseSchema.parse(raw).countries;
}

export async function fetchAdminCountryOptions(): Promise<AdminCountryOption[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_COUNTRY_OPTIONS_ENDPOINT, 'GET');

  return adminCountryOptionsResponseSchema.parse(raw).countries;
}

export async function createAdminCountry(body: CreateAdminCountryBody): Promise<AdminCountry> {
  const raw = await apiClientRequest<unknown, CreateAdminCountryBody>(
    V1_ADMIN_COUNTRIES_ENDPOINT,
    'POST',
    body,
  );

  return adminCountrySchema.parse(raw);
}
