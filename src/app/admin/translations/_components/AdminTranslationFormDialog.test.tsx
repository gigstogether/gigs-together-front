import { render, screen } from '@testing-library/react';

import AdminTranslationFormDialog from '@/app/admin/translations/_components/AdminTranslationFormDialog';
import { stubResizeObserver } from '@/test-utils/moderator-telegram-session-mock';

describe('AdminTranslationFormDialog', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  it('should show key validation error and disable submit for invalid key', () => {
    render(
      <AdminTranslationFormDialog
        mode="create"
        open
        initialValues={{
          namespace: 'about',
          locale: 'en',
          key: 'invalid_key',
          value: 'About',
          kind: 'text',
          isActive: true,
        }}
        namespaces={['about']}
        locales={[{ iso: 'en', nativeName: 'English', isActive: true, order: 0 }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Key must be a valid camelCase translation key.',
    );
    expect(screen.getByRole('button', { name: 'Create translation' })).toBeDisabled();
  });

  it('should enable submit when key matches camelCase rules', () => {
    render(
      <AdminTranslationFormDialog
        mode="create"
        open
        initialValues={{
          namespace: 'about',
          locale: 'en',
          key: 'welcomeTitle',
          value: 'About',
          kind: 'text',
          isActive: true,
        }}
        namespaces={['about']}
        locales={[{ iso: 'en', nativeName: 'English', isActive: true, order: 0 }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create translation' })).toBeEnabled();
  });
});
