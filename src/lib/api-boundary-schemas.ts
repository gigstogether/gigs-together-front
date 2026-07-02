import { z } from 'zod';
import type {
  V1GigAroundGetResponseBody,
  V1GigByPublicIdGetResponseBody,
  V1GigDatesGetResponseBody,
  V1GigGetResponseBody,
} from '@/lib/types';

const translationValueSchema = z.object({
  value: z.string(),
  format: z.enum(['plain', 'icu']),
});

const translationsByNamespaceSchema = z.record(
  z.string(),
  z.record(z.string(), translationValueSchema),
);

const localeGetTranslationsResponseBodySchema = z.object({
  locale: z.string().min(1),
  translations: translationsByNamespaceSchema,
});

const countrySchema = z.object({
  iso: z.string().min(1),
});

const countriesSchema = z.array(countrySchema);

const gigDateSchema = z.union([z.string().min(1), z.number().int().finite()]);

const gigSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    date: gigDateSchema,
    endDate: gigDateSchema.optional(),
    city: z.string().min(1),
    country: z.string().min(1),
    venue: z.string().min(1),
    ticketsUrl: z.string().min(1),
    posterUrl: z.string().min(1).optional(),
    calendarUrl: z.string().min(1).optional(),
    postUrl: z.string().min(1).optional(),
  })
  .strict();

const v1GigGetResponseBodySchema = z
  .object({
    gigs: z.array(gigSchema),
    prevCursor: z.string().min(1).optional(),
    nextCursor: z.string().min(1).optional(),
  })
  .strict();

const v1GigDatesGetResponseBodySchema = z
  .object({
    dates: z.array(gigDateSchema),
  })
  .strict();

const v1GigAroundGetResponseBodySchema = z
  .object({
    before: z.array(gigSchema),
    after: z.array(gigSchema),
    prevCursor: z.string().min(1).optional(),
    nextCursor: z.string().min(1).optional(),
  })
  .strict();

const v1GigByPublicIdGetResponseBodySchema = z
  .object({
    date: gigDateSchema,
  })
  .strict();

export function parseLocaleGetTranslationsResponseBody(raw: unknown) {
  return localeGetTranslationsResponseBodySchema.parse(raw);
}

export function parseCountries(raw: unknown) {
  return countriesSchema.parse(raw);
}

export function parseV1GigGetResponseBody(raw: unknown): V1GigGetResponseBody {
  return v1GigGetResponseBodySchema.parse(raw);
}

export function parseV1GigDatesGetResponseBody(raw: unknown): V1GigDatesGetResponseBody {
  return v1GigDatesGetResponseBodySchema.parse(raw);
}

export function parseV1GigAroundGetResponseBody(raw: unknown): V1GigAroundGetResponseBody {
  return v1GigAroundGetResponseBodySchema.parse(raw);
}

export function parseV1GigByPublicIdGetResponseBody(raw: unknown): V1GigByPublicIdGetResponseBody {
  return v1GigByPublicIdGetResponseBodySchema.parse(raw);
}
