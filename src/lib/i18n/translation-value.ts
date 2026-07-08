import type { V1TranslationValue } from '@/lib/api-boundary-schemas';

export type TParams = Readonly<Record<string, string | number | boolean | null | undefined>>;

export class TranslationValueResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslationValueResolutionError';
  }
}

export interface ResolveTranslationValueParams {
  readonly entry: V1TranslationValue | undefined;
  readonly namespace: string;
  readonly key: string;
  readonly params?: TParams;
}

function hasInterpolationParams(params: TParams | undefined): params is TParams {
  if (params === undefined) {
    return false;
  }

  return Object.keys(params).length > 0;
}

export function interpolatePlainTemplate(template: string, params: TParams): string {
  return template.replace(/\{(\w+)\}/g, (match, rawKey: string) => {
    const value = params[rawKey];
    if (value === null || value === undefined) {
      return match;
    }
    return String(value);
  });
}

function assertPlainFormat(entry: V1TranslationValue, namespace: string, key: string): void {
  if (entry.format !== 'plain') {
    throw new TranslationValueResolutionError(
      `Translation "${namespace}.${key}" uses unsupported format "${entry.format}".`,
    );
  }
}

export function resolveTranslationValue(params: ResolveTranslationValueParams): string {
  const { entry, namespace, key, params: interpolationParams } = params;

  if (entry === undefined) {
    return key;
  }

  assertPlainFormat(entry, namespace, key);

  if (hasInterpolationParams(interpolationParams)) {
    if (entry.kind !== 'template') {
      throw new TranslationValueResolutionError(
        `Translation "${namespace}.${key}" is not a template.`,
      );
    }

    return interpolatePlainTemplate(entry.value, interpolationParams);
  }

  return entry.value;
}
