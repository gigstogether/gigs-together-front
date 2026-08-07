import { z } from 'zod';
import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalBooleanFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';

const DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY = 'gt_tg_client_profile';

const DEFAULT_FEED_PAGE_SIZE = 10;
const DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS = 600_000; // 10 minutes

const PLAUSIBLE_SCRIPT_BASE_URL = 'https://plausible.io/js';

const clientEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    NEXT_PUBLIC_APP_BASE_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_APP_API_BASE_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_TELEGRAM_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_GITHUB_URL: optionalTrimmedStringFromEnvSchema,
    NEXT_PUBLIC_SUGGEST_GIG_ENABLED: optionalBooleanFromEnvSchema.default(false),
    NEXT_PUBLIC_AUTH_ENABLED: optionalBooleanFromEnvSchema.default(false),
    NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID: createOptionalPositiveIntegerFromEnvSchema(
      'NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID',
    ),
    NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY: optionalTrimmedStringFromEnvSchema.default(
      DEFAULT_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
    ),
    NEXT_PUBLIC_FEED_PAGE_SIZE: createOptionalPositiveIntegerFromEnvSchema(
      'NEXT_PUBLIC_FEED_PAGE_SIZE',
    ),
    NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS: createOptionalPositiveIntegerFromEnvSchema(
      'NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS',
    ),
    NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID: optionalTrimmedStringFromEnvSchema,
  })
  .superRefine((value, ctx) => {
    if (value.NEXT_PUBLIC_AUTH_ENABLED && !value.NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID is required when NEXT_PUBLIC_AUTH_ENABLED is true',
        path: ['NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID'],
      });
    }
  });

const parsedClientEnv = clientEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  NEXT_PUBLIC_APP_API_BASE_URL: process.env.NEXT_PUBLIC_APP_API_BASE_URL,
  NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
  NEXT_PUBLIC_SUGGEST_GIG_ENABLED: process.env.NEXT_PUBLIC_SUGGEST_GIG_ENABLED,
  NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED,
  NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID: process.env.NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID,
  NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY:
    process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
  NEXT_PUBLIC_FEED_PAGE_SIZE: process.env.NEXT_PUBLIC_FEED_PAGE_SIZE,
  NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS:
    process.env.NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS,
  NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID,
});

export const clientEnv = {
  nodeEnv: parsedClientEnv.NODE_ENV,
  isDevelopment: parsedClientEnv.NODE_ENV === 'development',
  appBaseUrl: parsedClientEnv.NEXT_PUBLIC_APP_BASE_URL,
  appApiBaseUrl: parsedClientEnv.NEXT_PUBLIC_APP_API_BASE_URL,
  telegramUrl: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_URL,
  githubUrl: parsedClientEnv.NEXT_PUBLIC_GITHUB_URL,
  isPublicSuggestGigEnabled: parsedClientEnv.NEXT_PUBLIC_SUGGEST_GIG_ENABLED,
  isAuthEnabled: parsedClientEnv.NEXT_PUBLIC_AUTH_ENABLED,
  telegramOidcClientId: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_OIDC_CLIENT_ID,
  telegramClientProfileStorageKey: parsedClientEnv.NEXT_PUBLIC_TELEGRAM_CLIENT_PROFILE_STORAGE_KEY,
  feedPageSize: parsedClientEnv.NEXT_PUBLIC_FEED_PAGE_SIZE ?? DEFAULT_FEED_PAGE_SIZE,
  feedCalendarDatesStaleTimeMs:
    parsedClientEnv.NEXT_PUBLIC_FEED_CALENDAR_DATES_STALE_TIME_MS ??
    DEFAULT_FEED_CALENDAR_DATES_STALE_TIME_MS,
  plausibleScriptSrc: parsedClientEnv.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID
    ? `${PLAUSIBLE_SCRIPT_BASE_URL}/${parsedClientEnv.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID}.js`
    : undefined,
} as const;
