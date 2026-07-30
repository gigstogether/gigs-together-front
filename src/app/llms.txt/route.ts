import { clientEnv } from '@/env/client-env';
import { getAppBaseUrlOrThrow, serverEnv } from '@/env/server-env';
import { buildLlmsTxtContent } from '@/lib/llms-txt-content';

export function GET(): Response {
  if (!serverEnv.isProductionSite) {
    return new Response(null, { status: 404 });
  }

  const content = buildLlmsTxtContent({
    baseUrl: getAppBaseUrlOrThrow(),
    telegramUrl: clientEnv.telegramUrl,
    githubUrl: clientEnv.githubUrl,
  });

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
