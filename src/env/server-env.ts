import 'server-only';

import { z } from 'zod';
import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';

const DEFAULT_TRANSLATIONS_REVALIDATE_SECONDS = 3_600; // 1 hour (60 minutes)

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  TRANSLATIONS_REVALIDATE_SECONDS: createOptionalPositiveIntegerFromEnvSchema(
    'TRANSLATIONS_REVALIDATE_SECONDS',
  ),
  FEED_REVALIDATE_SECRET: optionalTrimmedStringFromEnvSchema,
});

const parsedServerEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  TRANSLATIONS_REVALIDATE_SECONDS: process.env.TRANSLATIONS_REVALIDATE_SECONDS,
  FEED_REVALIDATE_SECRET: process.env.FEED_REVALIDATE_SECRET,
});

export const serverEnv = {
  nodeEnv: parsedServerEnv.NODE_ENV,
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
