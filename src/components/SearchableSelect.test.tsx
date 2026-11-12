import { fireEvent, render, screen } from '@testing-library/react';

import { SearchableSelect } from '@/components/SearchableSelect';

describe('SearchableSelect', () => {
  it('should filter options and select a matching value', () => {
    const onValueChange = vi.fn();

    render(
      <div>
        <span id="time-zone-label">Time zone:</span>
        <SearchableSelect
          id="time-zone"
          value=""
          options={[
            { value: 'Europe/Madrid', label: 'Europe/Madrid' },
            { value: 'America/New_York', label: 'America/New York' },
          ]}
          placeholder="Select time zone"
          searchPlaceholder="Search time zones"
          emptyText="No time zones found."
          ariaLabelledBy="time-zone-label"
          onValueChange={onValueChange}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Time zone:' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search time zones' }), {
      target: { value: 'Madrid' },
    });

    expect(screen.getByRole('option', { name: 'Europe/Madrid' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'America/New York' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Europe/Madrid' }));

    expect(onValueChange).toHaveBeenCalledWith('Europe/Madrid');
  });

  it('should show an explicit empty state when no options match', () => {
    render(
      <div>
        <span id="time-zone-label">Time zone:</span>
        <SearchableSelect
          id="time-zone"
          value=""
          options={[{ value: 'Europe/Madrid', label: 'Europe/Madrid' }]}
          placeholder="Select time zone"
          searchPlaceholder="Search time zones"
          emptyText="No time zones found."
          ariaLabelledBy="time-zone-label"
          onValueChange={vi.fn()}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Time zone:' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search time zones' }), {
      target: { value: 'Tokyo' },
    });

    expect(screen.getByText('No time zones found.')).toBeInTheDocument();
  });
});
