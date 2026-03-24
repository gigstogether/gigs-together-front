import GigFormClient from '@/app/gig-form/GigFormClient';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/translations.server';
import { I18nProvider } from '@/lib/i18n';

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider locale={i18n.locale} translations={i18n.translations}>
      <GigFormClient countries={countries} mode="edit" gigPublicId={publicId} />
    </I18nProvider>
  );
}
