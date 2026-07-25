import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationLocaleSelect from '@/app/admin/translations/_components/AdminTranslationLocaleSelect';

describe('AdminTranslationLocaleSelect', () => {
  it('should open locale options and call onChange when a locale is selected', () => {
    const onChange = vi.fn();

    render(
      <div>
        <span id="translation-form-locale-label">Locale</span>
        <AdminTranslationLocaleSelect
          id="translation-form-locale"
          value="en"
          locales={[
            { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
            { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
          ]}
          isDisabled={false}
          onChange={onChange}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Locale' }));
    fireEvent.click(screen.getByRole('option', { name: 'Español (es)' }));

    expect(onChange).toHaveBeenCalledWith('es');
  });

  it('should keep the open listbox inside the same container as the combobox', () => {
    render(
      <div>
        <span id="translation-form-locale-label">Locale</span>
        <AdminTranslationLocaleSelect
          id="translation-form-locale"
          value="en"
          locales={[
            { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
            { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
          ]}
          isDisabled={false}
          onChange={vi.fn()}
        />
      </div>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Locale' });
    fireEvent.click(combobox);

    const listbox = screen.getByRole('listbox');
    expect(combobox.parentElement?.contains(listbox)).toBe(true);
  });
});
