import { z } from 'zod';
import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalBooleanFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';

const DEFAULT_BRAND_NAME = 'Gigs Together';
const DEFAULT_SITE_PREVIEW_TITLE = 'Gigs Together!';
const DEFAULT_SITE_PREVIEW_DESCRIPTION = 'Find gigs and company in your city.';
const DEFAULT_ADMIN_API_BASE_URL = '/api/admin';
const DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY = 'gt_tg_client_profile';

const DEFAULT_FEED_PAGE_SIZE = 10;
const DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS = 600_000; // 10 minutes

const clientEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    NEXT_PUBLIC_APP_BASE_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_APP_API_BASE_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_ADMIN_API_BASE_URL: optionalTrimmedStringFromEnvSchema.default(
      DEFAULT_ADMIN_API_BASE_URL,
    ),
    NEXT_PUBLIC_BRAND_NAME: optionalTrimmedStringFromEnvSchema.default(DEFAULT_BRAND_NAME),
    NEXT_PUBLIC_SITE_PREVIEW_TITLE: optionalTrimmedStringFromEnvSchema.default(
      DEFAULT_SITE_PREVIEW_TITLE,
    ),
    NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION: optionalTrimmedStringFromEnvSchema.default(
      DEFAULT_SITE_PREVIEW_DESCRIPTION,
    ),
    NEXT_PUBLIC_TELEGRAM_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_GITHUB_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_SUGGEST_GIG_LINK: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_AUTH_ENABLED: optionalBooleanFromEnvSchema.default(false),
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY: optionalTrimmedStringFromEnvSchema.default(
      DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
    ),
    NEXT_PUBLIC_FEED_PAGE_SIZE: createOptionalPositiveIntegerFromEnvSchema(
      'NEXT_PUBLIC_FEED_PAGE_SIZE',
    ),
    NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS: createOptionalPositiveIntegerFromEnvSchema(
      'NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS',
    ),
  })
  .superRefine((value, ctx) => {
    if (value.NEXT_PUBLIC_AUTH_ENABLED && !value.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is required when NEXT_PUBLIC_AUTH_ENABLED is true',
        path: ['NEXT_PUBLIC_TELEGRAM_BOT_USERNAME'],
      });
    }
  });

const parsedClientEnv = clientEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  NEXT_PUBLIC_APP_API_BASE_URL: process.env.NEXT_PUBLIC_APP_API_BASE_URL,
  NEXT_PUBLIC_ADMIN_API_BASE_URL: process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL,
  NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  NEXT_PUBLIC_SITE_PREVIEW_TITLE: process.env.NEXT_PUBLIC_SITE_PREVIEW_TITLE,
  NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION,
  NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
  NEXT_PUBLIC_SUGGEST_GIG_LINK: process.env.NEXT_PUBLIC_SUGGEST_GIG_LINK,
  NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL:
    process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL,
  NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED,
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY:
    process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
  NEXT_PUBLIC_FEED_PAGE_SIZE: process.env.NEXT_PUBLIC_FEED_PAGE_SIZE,
  NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS:
    process.env.NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS,
});

export const clientEnv = {
  nodeEnv: parsedClientEnv.NODE_ENV,
  isDevelopment: parsedClientEnv.NODE_ENV === 'development',
  appBaseUrl: parsedClientEnv.NEXT_PUBLIC_APP_BASE_URL,
  appApiBaseUrl: parsedClientEnv.NEXT_PUBLIC_APP_API_BASE_URL,
  adminApiBaseUrl: parsedClientEnv.NEXT_PUBLIC_ADMIN_API_BASE_URL,
  brandName: parsedClientEnv.NEXT_PUBLIC_BRAND_NAME,
  sitePreviewTitle: parsedClientEnv.NEXT_PUBLIC_SITE_PREVIEW_TITLE,
  sitePreviewDescription: parsedClientEnv.NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION,
  telegramUrl: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_URL,
  githubUrl: parsedClientEnv.NEXT_PUBLIC_GITHUB_URL,
  suggestGigLink: parsedClientEnv.NEXT_PUBLIC_SUGGEST_GIG_LINK,
  telegramAuthSessionHelpUrl: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_AUTH_SESSION_HELP_URL,
  isAuthEnabled: parsedClientEnv.NEXT_PUBLIC_AUTH_ENABLED,
  telegramBotUsername: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  telegramClientProfileStorageKey: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
  feedPageSize: parsedClientEnv.NEXT_PUBLIC_FEED_PAGE_SIZE ?? DEFAULT_FEED_PAGE_SIZE,
  feedCalendarDatesStaleTimeMs:
    parsedClientEnv.NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS ??
    DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS,
} as const;

export function getPublicAppBaseUrlOrThrow(): string {
  if (!clientEnv.appBaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_APP_BASE_URL');
  }

  return clientEnv.appBaseUrl.replace(/\/$/, '');
}
