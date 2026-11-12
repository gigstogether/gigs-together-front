import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AdminLocationCatalogPageClient from './AdminLocationCatalogPageClient';

const fetchAdminCountriesMock = vi.fn();
const fetchAdminRegionsMock = vi.fn();
const fetchAdminLocalitiesMock = vi.fn();
const fetchAdminPlacesMock = vi.fn();
const createAdminRegionMock = vi.fn();

vi.mock('../_lib/admin-locations-api', () => ({
  fetchAdminRegions: () => fetchAdminRegionsMock(),
  fetchAdminLocalities: () => fetchAdminLocalitiesMock(),
  fetchAdminPlaces: () => fetchAdminPlacesMock(),
  createAdminRegion: (...args: unknown[]) => createAdminRegionMock(...args),
  updateAdminRegion: vi.fn(),
  deleteAdminRegion: vi.fn(),
  createAdminLocality: vi.fn(),
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
    fetchAdminRegionsMock.mockReset();
    fetchAdminLocalitiesMock.mockReset();
    fetchAdminPlacesMock.mockReset();
    createAdminRegionMock.mockReset();
    fetchAdminCountriesMock.mockResolvedValue([{ iso: 'ES' }]);
    fetchAdminRegionsMock.mockResolvedValue([
      { id: 'region-1', countryIso: 'ES', name: 'Catalonia', aliases: ['Catalunya'] },
    ]);
    fetchAdminLocalitiesMock.mockResolvedValue([
      {
        id: 'locality-1',
        regionId: 'region-1',
        name: 'Barcelona',
        aliases: [],
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
    createAdminRegionMock.mockResolvedValue({
      id: 'region-2',
      countryIso: 'ES',
      name: 'Andalusia',
      aliases: [],
    });
  });

  it('should render each catalog with its parent context', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: 'Places' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Barcelona.*Catalonia.*Spain \(ES\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Countries' }));
    expect(await screen.findByText('Spain')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Regions' }));
    expect(await screen.findByText('Catalonia')).toBeInTheDocument();
    expect(screen.getByText(/Spain \(ES\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Localities' }));
    expect(screen.getByText('Barcelona')).toBeInTheDocument();
    expect(screen.getByText(/Catalonia.*Spain \(ES\).*Europe\/Madrid/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Places' }));
    expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
    expect(screen.getByText(/Barcelona.*Catalonia.*Spain \(ES\)/)).toBeInTheDocument();
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

  it('should filter the active catalog by aliases', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Regions' }));
    expect(await screen.findByText('Catalonia')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search regions' }), {
      target: { value: 'Catalunya' },
    });

    expect(screen.getByText('Catalonia')).toBeInTheDocument();
  });

  it('should create a region with the selected country', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Razzmatazz')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Regions' }));
    const newRegionButton = await screen.findByRole('button', { name: 'New region' });
    await waitFor(() => expect(newRegionButton).toBeEnabled());
    fireEvent.click(newRegionButton);
    fireEvent.change(screen.getByLabelText('Canonical name:'), {
      target: { value: 'Andalusia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create region' }));

    await waitFor(() => {
      expect(createAdminRegionMock).toHaveBeenCalledWith({
        countryIso: 'ES',
        name: 'Andalusia',
        aliases: [],
      });
    });
  });
});
