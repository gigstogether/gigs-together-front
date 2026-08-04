import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationNamespaceCombobox from '@/app/admin/translations/_components/AdminTranslationNamespaceCombobox';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

describe('AdminTranslationNamespaceCombobox', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  it('should show filtered namespace suggestions when typing', () => {
    const onChange = vi.fn();

    render(
      <AdminTranslationNamespaceCombobox
        id="translation-form-namespace"
        value="cou"
        namespaces={['about', 'country', 'common']}
        isDisabled={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show namespace suggestions' }));

    expect(screen.getByRole('option', { name: 'country' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'about' })).not.toBeInTheDocument();
  });

  it('should allow selecting a custom namespace that does not exist yet', () => {
    const onChange = vi.fn();

    render(
      <AdminTranslationNamespaceCombobox
        id="translation-form-namespace"
        value="telegram"
        namespaces={['about', 'country']}
        isDisabled={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show namespace suggestions' }));
    fireEvent.click(screen.getByRole('option', { name: 'Use "telegram"' }));

    expect(onChange).toHaveBeenCalledWith('telegram');
  });

  it('should close suggestions when pointer down occurs outside the combobox', () => {
    render(
      <AdminTranslationNamespaceCombobox
        id="translation-form-namespace"
        value="about"
        namespaces={['about', 'country']}
        isDisabled={false}
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show namespace suggestions' }));
    expect(screen.getByRole('listbox', { name: 'Namespace suggestions' })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(
      screen.queryByRole('listbox', { name: 'Namespace suggestions' }),
    ).not.toBeInTheDocument();
  });
});
