import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationsFilterControls from '@/app/admin/translations/_components/AdminTranslationsFilterControls';
import {
  ADMIN_ALL_TRANSLATION_KINDS,
  ADMIN_ALL_TRANSLATION_LOCALES,
  ADMIN_ALL_TRANSLATION_NAMESPACES,
  ADMIN_ALL_TRANSLATION_STATUSES,
} from '@/app/admin/_lib/adminKeys';

describe('AdminTranslationsFilterControls', () => {
  it('should render filter dropdowns and create action in one row', () => {
    render(
      <AdminTranslationsFilterControls
        namespaces={['about', 'country']}
        selectedNamespace={ADMIN_ALL_TRANSLATION_NAMESPACES}
        onNamespaceChange={vi.fn()}
        isNamespacesLoading={false}
        locales={[
          { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
          { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
        ]}
        selectedLocaleFilter={ADMIN_ALL_TRANSLATION_LOCALES}
        onLocaleFilterChange={vi.fn()}
        isLocalesLoading={false}
        selectedKindFilter={ADMIN_ALL_TRANSLATION_KINDS}
        onKindFilterChange={vi.fn()}
        selectedStatusFilter={ADMIN_ALL_TRANSLATION_STATUSES}
        onStatusFilterChange={vi.fn()}
        isDisabled={false}
        onCreateClick={vi.fn()}
        isCreateDisabled={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Namespace' })).toHaveTextContent('All namespaces');
    expect(screen.getByRole('button', { name: 'Locale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kind' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New translation' })).toBeInTheDocument();
  });

  it('should call onCreateClick when new translation button is pressed', () => {
    const onCreateClick = vi.fn();

    render(
      <AdminTranslationsFilterControls
        namespaces={['about']}
        selectedNamespace="about"
        onNamespaceChange={vi.fn()}
        isNamespacesLoading={false}
        locales={[]}
        selectedLocaleFilter={ADMIN_ALL_TRANSLATION_LOCALES}
        onLocaleFilterChange={vi.fn()}
        isLocalesLoading={false}
        selectedKindFilter={ADMIN_ALL_TRANSLATION_KINDS}
        onKindFilterChange={vi.fn()}
        selectedStatusFilter={ADMIN_ALL_TRANSLATION_STATUSES}
        onStatusFilterChange={vi.fn()}
        isDisabled={false}
        onCreateClick={onCreateClick}
        isCreateDisabled={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'New translation' }));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('should call onNamespaceChange when a namespace option is selected', () => {
    const onNamespaceChange = vi.fn();

    render(
      <AdminTranslationsFilterControls
        namespaces={['about', 'country']}
        selectedNamespace={ADMIN_ALL_TRANSLATION_NAMESPACES}
        onNamespaceChange={onNamespaceChange}
        isNamespacesLoading={false}
        locales={[{ iso: 'en', nativeName: 'English', isActive: true, order: 0 }]}
        selectedLocaleFilter={ADMIN_ALL_TRANSLATION_LOCALES}
        onLocaleFilterChange={vi.fn()}
        isLocalesLoading={false}
        selectedKindFilter={ADMIN_ALL_TRANSLATION_KINDS}
        onKindFilterChange={vi.fn()}
        selectedStatusFilter={ADMIN_ALL_TRANSLATION_STATUSES}
        onStatusFilterChange={vi.fn()}
        isDisabled={false}
        onCreateClick={vi.fn()}
        isCreateDisabled={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Namespace' }));
    fireEvent.click(screen.getByRole('option', { name: 'country' }));

    expect(onNamespaceChange).toHaveBeenCalledWith('country');
  });
});
