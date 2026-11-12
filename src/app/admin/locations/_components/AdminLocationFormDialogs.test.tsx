import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminLocalityFormDialog from './localities/AdminLocalityFormDialog';
import AdminPlaceFormDialog from './places/AdminPlaceFormDialog';
import AdminRegionFormDialog from './regions/AdminRegionFormDialog';
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

  it('should submit a normalized region form when values are valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminRegionFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    expect(screen.getByRole('option', { name: 'Spain (ES)' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Spain (ES)' }));

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: '  Catalonia  ' },
    });
    fireEvent.change(screen.getByLabelText('Aliases:'), {
      target: { value: 'Catalunya, Cataluña\nCatalonha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create region' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        id: null,
        countryIso: 'ES',
        name: 'Catalonia',
        aliases: ['Catalunya', 'Cataluña', 'Catalonha'],
      });
    });
  });

  it('should submit a locality with a time zone from the selected country', async () => {
    stubCountryTimeZones({ ES: ['Africa/Ceuta', 'Atlantic/Canary', 'Europe/Madrid'] });
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminLocalityFormDialog
        value={null}
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Barcelona' },
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
        regionId: 'region-1',
        name: 'Barcelona',
        aliases: [],
        timeZone: 'Europe/Madrid',
      });
    });
  });

  it('should not show a time zone error before the user interacts with the form', () => {
    stubCountryTimeZones({ ES: ['Europe/Madrid'] });

    render(
      <AdminLocalityFormDialog
        value={null}
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Select a time zone.')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Time zone:' })).not.toBeInvalid();
    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent('Europe/Madrid');
    expect(screen.getByRole('button', { name: 'Create locality' })).toBeDisabled();
  });

  it('should select the only available time zone after the region changes', () => {
    stubCountryTimeZones({
      ES: ['Atlantic/Canary', 'Europe/Madrid'],
      FR: ['Europe/Paris'],
    });

    render(
      <AdminLocalityFormDialog
        value={null}
        regions={[
          { id: 'region-es', countryIso: 'ES', name: 'Catalonia', aliases: [] },
          { id: 'region-fr', countryIso: 'FR', name: 'Île-de-France', aliases: [] },
        ]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent(
      'Select time zone',
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Region:' }));
    fireEvent.click(screen.getByRole('option', { name: 'Île-de-France — France (FR)' }));

    expect(screen.getByRole('combobox', { name: 'Time zone:' })).toHaveTextContent('Europe/Paris');
  });

  it('should show all supported time zones when the country lookup is unavailable', () => {
    Reflect.deleteProperty(Intl.Locale.prototype, 'getTimeZones');
    vi.spyOn(Intl, 'supportedValuesOf').mockReturnValue(['America/New_York', 'Europe/Madrid']);

    render(
      <AdminLocalityFormDialog
        value={null}
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
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
        regions={[{ id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: [] }]}
        localities={[
          {
            id: 'locality-1',
            regionId: 'region-1',
            name: 'Barcelona',
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
    expect(screen.getByText('Barcelona — Catalonia — Spain (ES)')).toBeInTheDocument();
  });

  it('should show the save failure returned by the catalog operation', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Region already exists.'));

    render(
      <AdminRegionFormDialog
        value={null}
        countries={[{ iso: 'ES' }]}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Catalonia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create region' }));

    expect(await screen.findByText('Region already exists.')).toBeVisible();
  });
});
