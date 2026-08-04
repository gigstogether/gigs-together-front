import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { getTranslations } from '@/lib/i18n/translations.server';
import type { V1TranslationsByNamespace } from '@/lib/api-boundary-schemas';
import { resolveTranslationValue } from '@/lib/i18n/translation-value';

const NS = 'about';

export const dynamic = 'force-static';
// Must stay aligned with TRANSLATIONS_REVALIDATE_SECONDS (default 3600). Page ISR is a compile-time literal.
export const revalidate = 3_600; // 1 hour (60 minutes)

const t = (translations: V1TranslationsByNamespace, key: string): string =>
  resolveTranslationValue({
    entry: translations[NS]?.[key],
    namespace: NS,
    key,
  });

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getTranslations('en', NS);
  const title = t(i18n.translations, 'title');
  const description = t(i18n.translations, 'metaDescription');
  return {
    title,
    description,
  };
}

export default async function AboutPage() {
  const i18n = await getTranslations('en', NS);
  const title = t(i18n.translations, 'title');
  const content = t(i18n.translations, 'content');

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </main>
  );
}
