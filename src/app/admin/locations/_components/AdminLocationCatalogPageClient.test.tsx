import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AdminLocationCatalogPageClient from './AdminLocationCatalogPageClient';

const fetchAdminCountriesMock = vi.fn();
const fetchAdminLocalitiesMock = vi.fn();
const fetchAdminPlacesMock = vi.fn();
const createAdminLocalityMock = vi.fn();
const originalGetTimeZonesDescriptor = Object.getOwnPropertyDescriptor(
  Intl.Locale.prototype,
  'getTimeZones',
);

vi.mock('../_lib/admin-locations-api', () => ({
  fetchAdminLocalities: () => fetchAdminLocalitiesMock(),
  fetchAdminPlaces: () => fetchAdminPlacesMock(),
  createAdminLocality: (...args: unknown[]) => createAdminLocalityMock(...args),
  updateAdminLocality: vi.fn(),
  deleteAdminLocality: vi.fn(),
  createAdminPlace: vi.fn(),
  updateAdminPlace: vi.fn(),
  deleteAdminPlace: vi.fn(),
}));

vi.mock('../_lib/admin-countries-api', () => ({
  fetchAdminCountries: () => fetchAdminCountriesMock(),
  fetchAdminCountryOptions: vi.fn(),
  createAdminCountry: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminLocationCatalogPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminLocationCatalogPageClient', () => {
  beforeEach(() => {
    fetchAdminCountriesMock.mockReset();
    fetchAdminLocalitiesMock.mockReset();
    fetchAdminPlacesMock.mockReset();
    createAdminLocalityMock.mockReset();
    fetchAdminCountriesMock.mockResolvedValue([{ iso: 'ES' }]);
    fetchAdminLocalitiesMock.mockResolvedValue([
      {
        id: 'locality-1',
        countryIso: 'ES',
        name: 'Barcelona',
        qualifier: 'Barcelona province',
        aliases: ['Barna'],
        timeZone: 'Europe/Madrid',
      },
    ]);
    fetchAdminPlacesMock.mockResolvedValue([
      {
        id: 'place-1',
        localityId: 'locality-1',
        name: 'Razzmatazz',
        aliases: ['Sala Razzmatazz'],
        isActive: true,
      },
    ]);
    createAdminLocalityMock.mockResolvedValue({
      id: 'locality-2',
      countryIso: 'ES',
      name: 'Badalona',
      aliases: [],
      timeZone: 'Europe/Madrid',
    });
    Object.defineProperty(Intl.Locale.prototype, 'getTimeZones', {
      configurable: true,
      value: () => ['Europe/Madrid'],
    });
  });

  afterEach(() => {
    if (originalGetTimeZonesDescriptor) {
      Object.defineProperty(Intl.Locale.prototype, 'getTimeZones', originalGetTimeZonesDescriptor);
      return;
    }

    Reflect.deleteProperty(Intl.Locale.prototype, 'getTimeZones');
  });

  it('should render each catalog with its parent context', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: 'Places' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Barcelona \(Barcelona province\).*Spain \(ES\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Countries' }));
    expect(await screen.findByText('Spain')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Localities' }));
    expect(screen.getByText('Barcelona (Barcelona province)')).toBeInTheDocument();
    expect(screen.getByText(/Spain \(ES\).*Europe\/Madrid/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Places' }));
    expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
  });

  it('should order tabs, action, and search for responsive layout', async () => {
    renderPage();

    await screen.findByText('Razzmatazz');
    const controls = screen.getByRole('group', { name: 'Location catalog controls' });
    const tablist = within(controls).getByRole('tablist', { name: 'Location catalogs' });
    const action = within(controls).getByRole('button', { name: 'New place' });
    const search = within(controls).getByRole('textbox', { name: 'Search places' });
    const tabs = within(tablist).getAllByRole('tab');

    expect(controls).toHaveClass('flex-col', 'lg:flex-row');
    tabs.forEach((tab) => expect(tab).toHaveClass('flex-1', 'lg:flex-none'));
    expect(Array.from(controls.children)).toEqual([tablist, action, search]);

    fireEvent.click(within(tablist).getByRole('tab', { name: 'Countries' }));

    const addCountry = await screen.findByRole('button', { name: 'Add country' });
    const countryControls = screen.getByRole('group', { name: 'Location catalog controls' });
    const countryTablist = within(countryControls).getByRole('tablist', {
      name: 'Location catalogs',
    });
    expect(Array.from(countryControls.children)).toEqual([countryTablist, addCountry]);
  });

  it('should filter Localities by aliases', async () => {
    renderPage();

    await screen.findByText('Razzmatazz');
    fireEvent.click(screen.getByRole('tab', { name: 'Localities' }));
    expect(await screen.findByText('Barcelona (Barcelona province)')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search localities' }), {
      target: { value: 'Barna' },
    });

    expect(screen.getByText('Barcelona (Barcelona province)')).toBeInTheDocument();
  });

  it('should create a Locality under the selected Country', async () => {
    renderPage();

    await screen.findByText('Razzmatazz');
    fireEvent.click(screen.getByRole('tab', { name: 'Localities' }));
    const newLocalityButton = await screen.findByRole('button', { name: 'New locality' });
    await waitFor(() => expect(newLocalityButton).toBeEnabled());
    fireEvent.click(newLocalityButton);
    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Badalona' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create locality' }));

    await waitFor(() => {
      expect(createAdminLocalityMock).toHaveBeenCalledWith({
        countryIso: 'ES',
        name: 'Badalona',
        aliases: [],
        timeZone: 'Europe/Madrid',
      });
    });
  });
});
