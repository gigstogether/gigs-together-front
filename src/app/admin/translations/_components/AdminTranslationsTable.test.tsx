import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationsTable from '@/app/admin/translations/_components/AdminTranslationsTable';

describe('AdminTranslationsTable', () => {
  it('should render translation rows and call edit handler', () => {
    const onEdit = vi.fn();

    render(
      <AdminTranslationsTable
        records={[
          {
            id: '64f1a2b3c4d5e6f7a8b9c0d1',
            namespace: 'about',
            locale: 'en',
            key: 'title',
            value: 'About',
            format: 'plain',
            kind: 'text',
            isActive: true,
          },
        ]}
        locales={[{ iso: 'en', nativeName: 'English', isActive: true, order: 0 }]}
        showNamespaceColumn={false}
        isSaving={false}
        onEdit={onEdit}
        onSetActive={vi.fn()}
      />,
    );

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('English (en)')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Namespace' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit translation title' }));

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '64f1a2b3c4d5e6f7a8b9c0d1',
        key: 'title',
      }),
    );
  });
});
