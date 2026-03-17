import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { getTranslations } from '@/lib/translations.server';
import type { V1TranslationsByNamespace } from '@/lib/translations.server';

const NS = 'about';

export const dynamic = 'force-static';
export const revalidate = 3600; // ISR: regenerate every hour when translations change

const t = (translations: V1TranslationsByNamespace, key: string): string =>
  translations?.[NS]?.[key]?.value ?? '';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getTranslations('en', NS);
  const title = t(i18n.translations, 'title');
  const description = t(i18n.translations, 'meta_description');
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
