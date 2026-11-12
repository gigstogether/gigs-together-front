import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminLocalityFormDialog from './localities/AdminLocalityFormDialog';
import AdminPlaceFormDialog from './places/AdminPlaceFormDialog';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

const originalGetTimeZonesDescriptor = Object.getOwnPropertyDescriptor(
  Intl.Locale.prototype,
  'getTimeZones',
);

function stubCountryTimeZones(timeZonesByCountry: Record<string, string[]>) {
  Object.defineProperty(Intl.Locale.prototype, 'getTimeZones', {
    configurable: true,
    value(this: Intl.Locale) {
      if (!this.region) {
        return undefined;
      }

      return timeZonesByCountry[this.region] ?? [];
    },
  });
}

describe('AdminLocationFormDialogs', () => {
  beforeEach(() => {
    stubResizeObserver();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalGetTimeZonesDescriptor) {
      Object.defineProperty(Intl.Locale.prototype, 'getTimeZones', originalGetTimeZonesDescriptor);
      return;
    }

    Reflect.deleteProperty(Intl.Locale.prototype, 'getTimeZones');
  });

  it('should submit a locality under the selected country', async () => {
    stubCountryTimeZones({ ES: ['Africa/Ceuta', 'Atlantic/Canary', 'Europe/Madrid'] });
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Barcelona' },
    });
    fireEvent.change(screen.getByLabelText('Qualifier:'), {
      target: { value: ' Barcelona province ' },
    });
    fireEvent.click(screen.getByRole('combobox', { name: 'Time zone:' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search time zones' }), {
      target: { value: 'Madrid' },
    });
    fireEvent.click(screen.getByRole('option', { name: 'Europe/Madrid' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create locality' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        id: null,
        countryIso: 'ES',
        name: 'Barcelona',
        qualifier: 'Barcelona province',
        aliases: [],
        timeZone: 'Europe/Madrid',
      });
    });
  });

  it('should select the only available time zone without showing an initial error', () => {
    stubCountryTimeZones({ ES: ['Europe/Madrid'] });

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Select a time zone.')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Time zone:' })).not.toBeInvalid();
    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent('Europe/Madrid');
  });

  it('should select the only available time zone after the country changes', () => {
    stubCountryTimeZones({
      ES: ['Atlantic/Canary', 'Europe/Madrid'],
      FR: ['Europe/Paris'],
    });

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }, { iso: 'FR' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent(
      'Select time zone',
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'France (FR)' }));

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent('Europe/Paris');
  });

  it('should clear a time zone that is invalid for the selected country', () => {
    stubCountryTimeZones({
      ES: ['Europe/Madrid'],
      PT: ['Atlantic/Azores', 'Europe/Lisbon'],
    });

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }, { iso: 'PT' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent('Europe/Madrid');
    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'Portugal (PT)' }));

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent(
      'Select time zone',
    );
  });

  it('should show all supported time zones when the country lookup is unavailable', () => {
    Reflect.deleteProperty(Intl.Locale.prototype, 'getTimeZones');
    vi.spyOn(Intl, 'supportedValuesOf').mockReturnValue(['America/New_York', 'Europe/Madrid']);

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Time zone:' }));

    expect(screen.getByRole('option', { name: 'UTC' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'America/New York' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Europe/Madrid' })).toBeInTheDocument();
  });

  it('should expose the active state when editing a place', () => {
    render(
      <AdminPlaceFormDialog
        value={{
          id: 'place-1',
          localityId: 'locality-1',
          name: 'Razzmatazz',
          aliases: [],
          isActive: false,
        }}
        localities={[
          {
            id: 'locality-1',
            countryIso: 'ES',
            name: 'Barcelona',
            qualifier: 'Barcelona province',
            aliases: [],
            timeZone: 'Europe/Madrid',
          },
        ]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('switch', { name: 'Active:' })).not.toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Locality:' })).toBeDisabled();
    expect(screen.getByText('Barcelona (Barcelona province) — Spain (ES)')).toBeInTheDocument();
  });

  it('should distinguish same-name Localities in the Place form', () => {
    render(
      <AdminPlaceFormDialog
        value={null}
        localities={[
          {
            id: 'locality-1',
            countryIso: 'ES',
            name: 'San Pedro',
            qualifier: 'Albacete province',
            aliases: [],
            timeZone: 'Europe/Madrid',
          },
          {
            id: 'locality-2',
            countryIso: 'ES',
            name: 'San Pedro',
            qualifier: 'Murcia region',
            aliases: [],
            timeZone: 'Europe/Madrid',
          },
        ]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Locality:' }));

    expect(
      screen.getByRole('option', { name: 'San Pedro (Albacete province) — Spain (ES)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'San Pedro (Murcia region) — Spain (ES)' }),
    ).toBeInTheDocument();
  });

  it('should show the save failure returned by the locality operation', async () => {
    stubCountryTimeZones({ ES: ['Europe/Madrid'] });
    const onSubmit = vi.fn().mockRejectedValue(new Error('Locality already exists.'));

    render(
      <AdminLocalityFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Barcelona' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create locality' }));

    expect(await screen.findByText('Locality already exists.')).toBeVisible();
  });
});
