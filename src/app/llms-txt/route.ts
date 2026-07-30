import { clientEnv } from '@/env/client-env';
import { getAppBaseUrlOrThrow, serverEnv } from '@/env/server-env';
import {
  buildLlmsTxtContent,
  LLMS_TRANSLATION_NAMESPACE,
  LlmsTxtContentError,
} from './llms-txt-content';
import { getTranslations } from '@/lib/translations.server';

export async function GET(): Promise<Response> {
  if (!serverEnv.isProductionSite) {
    return new Response(null, { status: 404 });
  }

  try {
    const i18n = await getTranslations('en', LLMS_TRANSLATION_NAMESPACE);
    const llmsTranslations = i18n.translations[LLMS_TRANSLATION_NAMESPACE];

    if (llmsTranslations === undefined) {
      throw new LlmsTxtContentError(
        `Missing "${LLMS_TRANSLATION_NAMESPACE}" translation namespace.`,
      );
    }

    const content = buildLlmsTxtContent({
      baseUrl: getAppBaseUrlOrThrow(),
      translations: llmsTranslations,
      telegramUrl: clientEnv.telegramUrl,
      githubUrl: clientEnv.githubUrl,
    });

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e) {
    if (e instanceof LlmsTxtContentError) {
      return new Response(e.message, { status: 503 });
    }

    throw e;
  }
}
