import { fireEvent, render, screen } from '@testing-library/react';

import SuggestGigVenuesField from './SuggestGigVenuesField';

const FIELD_PROPS = {
  options: [
    { value: 'venue-1', label: 'Razzmatazz' },
    { value: 'venue-2', label: 'Sala Apolo' },
  ],
  placeholder: 'Select a venue',
  isDisabled: false,
  isInvalid: false,
};

describe('SuggestGigVenuesField', () => {
  it('should offer a removed venue again when the controlled selection is updated', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SuggestGigVenuesField
        {...FIELD_PROPS}
        value={['venue-1', 'venue-2']}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove venue 1' }));
    expect(onValueChange).toHaveBeenCalledWith(['venue-2']);

    rerender(
      <SuggestGigVenuesField
        {...FIELD_PROPS}
        value={['venue-2']}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Venue:' }));

    expect(screen.getByRole('option', { name: 'Razzmatazz' })).toBeEnabled();
  });

  it('should display one empty selector when the controlled selection is cleared while adding a venue', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SuggestGigVenuesField
        {...FIELD_PROPS}
        value={['venue-1']}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));

    rerender(
      <SuggestGigVenuesField
        {...FIELD_PROPS}
        value={[]}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Venue:' })).toHaveTextContent('Select a venue');
    expect(screen.queryByRole('combobox', { name: 'Venue 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove venue 1' })).not.toBeInTheDocument();
  });
});
