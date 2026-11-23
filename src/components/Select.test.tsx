import { fireEvent, render, screen } from '@testing-library/react';

import { Select } from '@/components/Select';

describe('Select', () => {
  it('should open options and select a value', () => {
    const onValueChange = vi.fn();

    render(
      <div>
        <span id="country-label">Country:</span>
        <Select
          id="country"
          value="ES"
          options={[
            { value: 'ES', label: 'Spain (ES)' },
            { value: 'FR', label: 'France (FR)' },
          ]}
          placeholder="Select country"
          ariaLabelledBy="country-label"
          onValueChange={onValueChange}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'France (FR)' }));

    expect(onValueChange).toHaveBeenCalledWith('FR');
  });

  it('should keep the listbox inside the select container', () => {
    render(
      <div>
        <span id="country-label">Country:</span>
        <Select
          id="country"
          value="ES"
          options={[{ value: 'ES', label: 'Spain (ES)' }]}
          placeholder="Select country"
          ariaLabelledBy="country-label"
          onValueChange={vi.fn()}
        />
      </div>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Country:' });
    fireEvent.click(combobox);

    expect(combobox.parentElement?.contains(screen.getByRole('listbox'))).toBe(true);
  });

  it('should expose required, invalid, and disabled states', () => {
    render(
      <div>
        <span id="country-label">Country:</span>
        <Select
          id="country"
          value=""
          options={[]}
          placeholder="Select country"
          ariaLabelledBy="country-label"
          isDisabled
          isRequired
          isInvalid
          onValueChange={vi.fn()}
        />
      </div>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Country:' });

    expect(combobox).toBeDisabled();
    expect(combobox).toBeRequired();
    expect(combobox).toBeInvalid();
  });
});
