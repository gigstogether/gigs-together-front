import { z } from 'zod';

export const optionalTrimmedStringFromEnvSchema = z.preprocess((rawValue) => {
  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }
  if (typeof rawValue !== 'string') {
    return rawValue;
  }

  const trimmedValue = rawValue.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
}, z.string().optional());

export function createOptionalPositiveIntegerFromEnvSchema(valueName: string) {
  return z.preprocess(
    (rawValue) => {
      if (rawValue === undefined || rawValue === null) {
        return undefined;
      }
      if (typeof rawValue !== 'string') {
        return rawValue;
      }

      const trimmedValue = rawValue.trim();
      return trimmedValue === '' ? undefined : trimmedValue;
    },
    z
      .string()
      .optional()
      .transform((rawValue, ctx) => {
        if (rawValue === undefined) {
          return undefined;
        }

        const parsedValue = Number(rawValue);
        if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue) || parsedValue <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${valueName} must be a positive integer (got "${rawValue}")`,
          });
          return z.NEVER;
        }

        return parsedValue;
      }),
  );
}

export const optionalBooleanFromEnvSchema = z.preprocess(
  (rawValue) => {
    if (rawValue === undefined || rawValue === null) {
      return undefined;
    }
    if (typeof rawValue !== 'string') {
      return rawValue;
    }

    const normalizedValue = rawValue.trim().toLowerCase();
    if (normalizedValue === '') {
      return undefined;
    }
    if (normalizedValue === 'true' || normalizedValue === '1') {
      return true;
    }
    if (normalizedValue === 'false' || normalizedValue === '0') {
      return false;
    }

    return rawValue;
  },
  z
    .boolean({
      invalid_type_error: 'Expected boolean-like env value: use true/false/1/0',
      required_error: 'Expected boolean-like env value: use true/false/1/0',
    })
    .optional(),
);
