import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationFormDialog from '@/app/admin/translations/_components/AdminTranslationFormDialog';
import { stubResizeObserver } from '@/test-utils/moderator-telegram-session-mock';

describe('AdminTranslationFormDialog', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  it('should keep kind selection inside the dialog without opening a portaled listbox', () => {
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

    const kindGroup = screen.getByRole('radiogroup', { name: 'Kind' });
    expect(kindGroup).toHaveAttribute('id', 'translation-form-kind');

    fireEvent.click(screen.getByRole('radio', { name: 'Template' }));

    expect(screen.getByRole('radio', { name: 'Template' })).toHaveAttribute('data-state', 'on');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should associate the active switch with its visible label', () => {
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

    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
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
