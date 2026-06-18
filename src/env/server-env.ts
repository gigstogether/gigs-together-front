import 'server-only';

import { z } from 'zod';
import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';

const DEFAULT_TRANSLATIONS_REVALIDATE_SECONDS = 3_600; // 1 hour (60 minutes)
const DEFAULT_BRAND_NAME = 'Gigs Together';
const DEFAULT_SITE_PREVIEW_TITLE = 'Gigs Together!';
const DEFAULT_SITE_PREVIEW_DESCRIPTION = 'Find gigs and company in your city.';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  APP_BASE_URL: optionalTrimmedStringFromEnvSchema,
  BRAND_NAME: optionalTrimmedStringFromEnvSchema.default(DEFAULT_BRAND_NAME),
  SITE_PREVIEW_TITLE: optionalTrimmedStringFromEnvSchema.default(DEFAULT_SITE_PREVIEW_TITLE),
  SITE_PREVIEW_DESCRIPTION: optionalTrimmedStringFromEnvSchema.default(
    DEFAULT_SITE_PREVIEW_DESCRIPTION,
  ),
  TRANSLATIONS_REVALIDATE_SECONDS: createOptionalPositiveIntegerFromEnvSchema(
    'TRANSLATIONS_REVALIDATE_SECONDS',
  ),
  FEED_REVALIDATE_SECRET: optionalTrimmedStringFromEnvSchema,
});

const parsedServerEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_BASE_URL: process.env.APP_BASE_URL,
  BRAND_NAME: process.env.BRAND_NAME,
  SITE_PREVIEW_TITLE: process.env.SITE_PREVIEW_TITLE,
  SITE_PREVIEW_DESCRIPTION: process.env.SITE_PREVIEW_DESCRIPTION,
  TRANSLATIONS_REVALIDATE_SECONDS: process.env.TRANSLATIONS_REVALIDATE_SECONDS,
  FEED_REVALIDATE_SECRET: process.env.FEED_REVALIDATE_SECRET,
});

function isStagingAppBaseUrl(appBaseUrl: string | undefined): boolean {
  if (!appBaseUrl) {
    return false;
  }

  const hostnameLabels = new URL(appBaseUrl).hostname.split('.');

  return hostnameLabels.some((label) => label === 'stg' || label === 'staging');
}

export const serverEnv = {
  nodeEnv: parsedServerEnv.NODE_ENV,
  isDevelopment: parsedServerEnv.NODE_ENV === 'development',
  isStaging: isStagingAppBaseUrl(parsedServerEnv.APP_BASE_URL),
  appBaseUrl: parsedServerEnv.APP_BASE_URL,
  brandName: parsedServerEnv.BRAND_NAME,
  sitePreviewTitle: parsedServerEnv.SITE_PREVIEW_TITLE,
  sitePreviewDescription: parsedServerEnv.SITE_PREVIEW_DESCRIPTION,
  translationsRevalidateSeconds:
    parsedServerEnv.TRANSLATIONS_REVALIDATE_SECONDS ?? DEFAULT_TRANSLATIONS_REVALIDATE_SECONDS,
  feedRevalidateSecret: parsedServerEnv.FEED_REVALIDATE_SECRET,
} as const;

export function getFeedRevalidateSecretOrThrow(): string {
  const secret = serverEnv.feedRevalidateSecret;
  if (!secret) {
    throw new Error('Missing FEED_REVALIDATE_SECRET');
  }

  return secret;
}

export function getAppBaseUrlOrThrow(): string {
  const baseUrl = serverEnv.appBaseUrl;
  if (!baseUrl) {
    throw new Error('Missing APP_BASE_URL');
  }

  return baseUrl.replace(/\/$/, '');
}
