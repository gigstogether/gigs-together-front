import { z } from 'zod';

const translationValueSchema = z.object({
  value: z.string(),
  format: z.enum(['plain', 'icu']),
});

const translationsByNamespaceSchema = z.record(
  z.string(),
  z.record(z.string(), translationValueSchema),
);

const languageGetTranslationsResponseBodySchema = z.object({
  locale: z.string().min(1),
  translations: translationsByNamespaceSchema,
});

const countrySchema = z.object({
  iso: z.string().min(1),
});

const countriesSchema = z.array(countrySchema);

export function parseLanguageGetTranslationsResponseBody(raw: unknown) {
  return languageGetTranslationsResponseBodySchema.parse(raw);
}

export function parseCountries(raw: unknown) {
  return countriesSchema.parse(raw);
}
