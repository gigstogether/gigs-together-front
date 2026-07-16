import { fireEvent, render, screen } from '@testing-library/react';

import AdminTranslationLocaleSelect from '@/app/admin/translations/_components/AdminTranslationLocaleSelect';

describe('AdminTranslationLocaleSelect', () => {
  it('should open locale options and call onChange when a locale is selected', () => {
    const onChange = vi.fn();

    render(
      <AdminTranslationLocaleSelect
        id="translation-form-locale"
        value="en"
        locales={[
          { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
          { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
        ]}
        isDisabled={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Español (es)' }));

    expect(onChange).toHaveBeenCalledWith('es');
  });
});
