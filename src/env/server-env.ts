import 'server-only';

import { z } from 'zod';
import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';

const DEFAULT_TRANSLATIONS_REVALIDATE_SECONDS = 3_600; // 1 hour (60 minutes)
/** Posters from the initial feed batch that may appear above the fold (grid up to 5 cols). */
const DEFAULT_EAGER_INITIAL_POSTER_COUNT = 5;
const DEFAULT_BRAND_NAME = 'Gigs Together';
const DEFAULT_SITE_PREVIEW_TITLE = 'Gigs Together!';
const DEFAULT_SITE_PREVIEW_DESCRIPTION = 'Find gigs and company in your city.';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  NEXT_PUBLIC_APP_BASE_URL: optionalTrimmedStringFromEnvSchema,
  BRAND_NAME: optionalTrimmedStringFromEnvSchema.default(DEFAULT_BRAND_NAME),
  SITE_PREVIEW_TITLE: optionalTrimmedStringFromEnvSchema.default(DEFAULT_SITE_PREVIEW_TITLE),
  SITE_PREVIEW_DESCRIPTION: optionalTrimmedStringFromEnvSchema.default(
    DEFAULT_SITE_PREVIEW_DESCRIPTION,
  ),
  TRANSLATIONS_REVALIDATE_SECONDS: createOptionalPositiveIntegerFromEnvSchema(
    'TRANSLATIONS_REVALIDATE_SECONDS',
  ),
  EAGER_INITIAL_POSTER_COUNT: createOptionalPositiveIntegerFromEnvSchema(
    'EAGER_INITIAL_POSTER_COUNT',
  ),
  FEED_REVALIDATE_SECRET: optionalTrimmedStringFromEnvSchema,
  TRANSLATIONS_REVALIDATE_SECRET: optionalTrimmedStringFromEnvSchema,
});

const parsedServerEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  BRAND_NAME: process.env.BRAND_NAME,
  SITE_PREVIEW_TITLE: process.env.SITE_PREVIEW_TITLE,
  SITE_PREVIEW_DESCRIPTION: process.env.SITE_PREVIEW_DESCRIPTION,
  TRANSLATIONS_REVALIDATE_SECONDS: process.env.TRANSLATIONS_REVALIDATE_SECONDS,
  EAGER_INITIAL_POSTER_COUNT: process.env.EAGER_INITIAL_POSTER_COUNT,
  FEED_REVALIDATE_SECRET: process.env.FEED_REVALIDATE_SECRET,
  TRANSLATIONS_REVALIDATE_SECRET: process.env.TRANSLATIONS_REVALIDATE_SECRET,
});

function isStagingAppBaseUrl(appBaseUrl: string | undefined): boolean {
  if (!appBaseUrl) {
    return false;
  }

  const hostnameLabels = new URL(appBaseUrl).hostname.split('.');

  return hostnameLabels.some((label) => label === 'stg' || label === 'staging');
}

function isLocalAppBaseUrl(appBaseUrl: string | undefined): boolean {
  if (!appBaseUrl) {
    return false;
  }

  const hostname = new URL(appBaseUrl).hostname;

  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isProductionSite(
  nodeEnv: (typeof parsedServerEnv)['NODE_ENV'],
  appBaseUrl: string | undefined,
): boolean {
  if (nodeEnv !== 'production') {
    return false;
  }

  return !(isStagingAppBaseUrl(appBaseUrl) || isLocalAppBaseUrl(appBaseUrl));
}

export const serverEnv = {
  nodeEnv: parsedServerEnv.NODE_ENV,
  isDevelopment: parsedServerEnv.NODE_ENV === 'development',
  isStaging: isStagingAppBaseUrl(parsedServerEnv.NEXT_PUBLIC_APP_BASE_URL),
  isProductionSite: isProductionSite(
    parsedServerEnv.NODE_ENV,
    parsedServerEnv.NEXT_PUBLIC_APP_BASE_URL,
  ),
  appBaseUrl: parsedServerEnv.NEXT_PUBLIC_APP_BASE_URL,
  brandName: parsedServerEnv.BRAND_NAME,
  sitePreviewTitle: parsedServerEnv.SITE_PREVIEW_TITLE,
  sitePreviewDescription: parsedServerEnv.SITE_PREVIEW_DESCRIPTION,
  translationsRevalidateSeconds:
    parsedServerEnv.TRANSLATIONS_REVALIDATE_SECONDS ?? DEFAULT_TRANSLATIONS_REVALIDATE_SECONDS,
  eagerInitialPosterCount:
    parsedServerEnv.EAGER_INITIAL_POSTER_COUNT ?? DEFAULT_EAGER_INITIAL_POSTER_COUNT,
  feedRevalidateSecret: parsedServerEnv.FEED_REVALIDATE_SECRET,
  translationsRevalidateSecret: parsedServerEnv.TRANSLATIONS_REVALIDATE_SECRET,
} as const;

export function getFeedRevalidateSecretOrThrow(): string {
  const secret = serverEnv.feedRevalidateSecret;
  if (!secret) {
    throw new Error('Missing FEED_REVALIDATE_SECRET');
  }

  return secret;
}

export function getTranslationsRevalidateSecretOrThrow(): string {
  const secret = serverEnv.translationsRevalidateSecret;
  if (!secret) {
    throw new Error('Missing TRANSLATIONS_REVALIDATE_SECRET');
  }

  return secret;
}

export function getAppBaseUrlOrThrow(): string {
  const baseUrl = serverEnv.appBaseUrl;
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_APP_BASE_URL');
  }

  return baseUrl.replace(/\/$/, '');
}
