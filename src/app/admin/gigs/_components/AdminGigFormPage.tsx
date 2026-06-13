import GigFormClient from '@/app/gig-form/GigFormClient';
import AdminGigDetailBackLink from '@/app/admin/gigs/_components/AdminGigDetailBackLink';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { I18nProvider } from '@/lib/i18n';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/translations.server';

interface AdminGigFormPageProps {
  readonly mode: 'create' | 'edit';
  readonly gigPublicId?: string;
}

export default async function AdminGigFormPage(props: AdminGigFormPageProps) {
  const { mode, gigPublicId } = props;
  const [countries, i18n] = await Promise.all([getCountries(), getTranslations('en', 'country')]);

  return (
    <I18nProvider
      locale={i18n.locale}
      translations={i18n.translations}
    >
      <div className="mx-auto w-full max-w-md">
        <AdminGigDetailBackLink />
        {/* TODO: create gig-form context to prevent prop drilling? */}
        <GigFormClient
          countries={countries}
          mode={mode}
          gigPublicId={gigPublicId}
          successReturnHref={GIG_FORM_ADMIN_BASE_PATH}
        />
      </div>
    </I18nProvider>
  );
}
