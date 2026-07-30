import type { V1TranslationValue } from '@/lib/api-boundary-schemas';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';

export const LLMS_TRANSLATION_NAMESPACE = 'llms';
export const LLMS_CONTENT_KEY = 'content';

export interface BuildLlmsTxtContentParams {
  readonly baseUrl: string;
  readonly translations: Readonly<Record<string, V1TranslationValue>>;
  readonly telegramUrl?: string;
  readonly githubUrl?: string;
}

export class LlmsTxtContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmsTxtContentError';
  }
}

function removeEmptyMarkdownLinkLines(content: string): string {
  return content.replace(/^- \[[^\]]+\]\(\):[^\n]*(?:\n|$)/gm, '');
}

function normalizeLlmsTxtContent(content: string): string {
  return `${removeEmptyMarkdownLinkLines(content).replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function buildLlmsTxtContent(params: BuildLlmsTxtContentParams): string {
  const { baseUrl, translations, telegramUrl, githubUrl } = params;
  const contentEntry = translations[LLMS_CONTENT_KEY];

  if (contentEntry === undefined) {
    throw new LlmsTxtContentError(`Missing required llms translation key "${LLMS_CONTENT_KEY}".`);
  }

  if (contentEntry.kind !== 'template') {
    throw new LlmsTxtContentError(`llms.${LLMS_CONTENT_KEY} must use kind "template".`);
  }

  const content = resolveTranslationValue({
    entry: contentEntry,
    namespace: LLMS_TRANSLATION_NAMESPACE,
    key: LLMS_CONTENT_KEY,
    params: {
      baseUrl,
      telegramUrl: telegramUrl ?? '',
      githubUrl: githubUrl ?? '',
    },
  });

  return normalizeLlmsTxtContent(content);
}
