/**
 * camelCase namespace identifier for translation records.
 *
 * Keep validation rules in sync with
 * `gigs-together-api/src/modules/translation/translation-identifiers.ts`.
 *
 * Rules:
 * - starts with a lowercase letter
 * - followed by up to 63 alphanumeric characters
 * - no dots, underscores, or hyphens
 */
const TRANSLATION_NAMESPACE_PATTERN = /^[a-z][a-zA-Z0-9]{0,63}$/;

export function isValidTranslationNamespace(namespace: string): boolean {
  return TRANSLATION_NAMESPACE_PATTERN.test(namespace);
}
