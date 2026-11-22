import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';

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

  it('should match options when the search omits diacritics', () => {
    render(
      <div>
        <span id="venue-label">Venue:</span>
        <SearchableSelect
          id="venue"
          value=""
          options={[{ value: 'olimpic', label: 'Palau Olímpic' }]}
          placeholder="Select venue"
          searchPlaceholder="Search venues"
          emptyText="No venues found."
          ariaLabelledBy="venue-label"
          onValueChange={vi.fn()}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Venue:' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search venues' }), {
      target: { value: 'PalauOlimpic' },
    });

    expect(screen.getByRole('option', { name: 'Palau Olímpic' })).toBeInTheDocument();
  });

  it('should forward form control properties to the trigger', () => {
    const onBlur = vi.fn();
    const triggerRef = createRef<HTMLButtonElement>();

    render(
      <div>
        <span id="country-label">Country:</span>
        <SearchableSelect
          id="country"
          name="country"
          value="ES"
          options={[{ value: 'ES', label: 'Spain' }]}
          placeholder="Select country"
          searchPlaceholder="Search countries"
          emptyText="No countries found."
          ariaLabelledBy="country-label"
          triggerRef={triggerRef}
          onBlur={onBlur}
          onValueChange={vi.fn()}
        />
      </div>,
    );

    const trigger = screen.getByRole('combobox', { name: 'Country:' });

    fireEvent.blur(trigger);

    expect(trigger).toHaveAttribute('name', 'country');
    expect(triggerRef.current).toBe(trigger);
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('should add and remove values in multiple selection mode without closing the list', () => {
    const onValueChange = vi.fn();
    const options = [
      { value: 'razzmatazz', label: 'Razzmatazz' },
      { value: 'sala-apolo', label: 'Sala Apolo' },
    ];
    const { rerender } = render(
      <div>
        <span id="venues-label">Venues:</span>
        <SearchableSelect
          id="venues"
          selectionMode="multiple"
          value={[]}
          options={options}
          placeholder="Select venues"
          searchPlaceholder="Search venues"
          emptyText="No venues found."
          ariaLabelledBy="venues-label"
          onValueChange={onValueChange}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Venues:' }));
    expect(screen.getByRole('listbox', { name: 'Venues:' })).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
    fireEvent.click(screen.getByRole('option', { name: 'Razzmatazz' }));

    expect(onValueChange).toHaveBeenLastCalledWith(['razzmatazz']);
    expect(screen.getByRole('option', { name: 'Sala Apolo' })).toBeInTheDocument();

    rerender(
      <div>
        <span id="venues-label">Venues:</span>
        <SearchableSelect
          id="venues"
          selectionMode="multiple"
          value={['razzmatazz']}
          options={options}
          placeholder="Select venues"
          searchPlaceholder="Search venues"
          emptyText="No venues found."
          ariaLabelledBy="venues-label"
          onValueChange={onValueChange}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('option', { name: 'Sala Apolo' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['razzmatazz', 'sala-apolo']);

    rerender(
      <div>
        <span id="venues-label">Venues:</span>
        <SearchableSelect
          id="venues"
          selectionMode="multiple"
          value={['razzmatazz', 'sala-apolo']}
          options={options}
          placeholder="Select venues"
          searchPlaceholder="Search venues"
          emptyText="No venues found."
          ariaLabelledBy="venues-label"
          onValueChange={onValueChange}
        />
      </div>,
    );

    expect(screen.getByRole('combobox', { name: 'Venues:' })).toHaveTextContent(
      'Razzmatazz, Sala Apolo',
    );
    fireEvent.click(screen.getByRole('option', { name: 'Razzmatazz' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['sala-apolo']);
  });
});
