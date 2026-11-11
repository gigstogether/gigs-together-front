import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AdminCountriesPageClient from '@/app/admin/locations/_components/AdminCountriesPageClient';

const fetchAdminCountriesMock = vi.fn();
const fetchAdminCountryOptionsMock = vi.fn();
const createAdminCountryMock = vi.fn();

vi.mock('@/app/admin/locations/_lib/admin-countries-api', () => ({
  fetchAdminCountries: () => fetchAdminCountriesMock(),
  fetchAdminCountryOptions: () => fetchAdminCountryOptionsMock(),
  createAdminCountry: (...args: unknown[]) => createAdminCountryMock(...args),
}));

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminCountriesPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminCountriesPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAdminCountriesMock.mockResolvedValue([{ iso: 'ES' }]);
    fetchAdminCountryOptionsMock.mockResolvedValue([
      { iso: 'FR', isConfigured: false },
      { iso: 'ES', isConfigured: true },
    ]);
    createAdminCountryMock.mockResolvedValue({ iso: 'FR' });
  });

  it('should render only configured countries in the page list', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('ES')).toBeInTheDocument();
      expect(screen.getByText('Spain')).toBeInTheDocument();
    });
    expect(fetchAdminCountryOptionsMock).not.toHaveBeenCalled();
  });

  it('should load country options when the add dialog opens', async () => {
    renderWithQueryClient();

    fireEvent.click(screen.getByRole('button', { name: 'Add country' }));

    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Spain/ })).toBeDisabled();
  });

  it('should add a selected country', async () => {
    renderWithQueryClient();
    fireEvent.click(screen.getByRole('button', { name: 'Add country' }));
    await waitFor(() => expect(screen.getByText('France')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /France/ }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Add country' }),
    );

    await waitFor(() => {
      expect(createAdminCountryMock).toHaveBeenCalledWith({ iso: 'FR' }, expect.anything());
    });
  });

  it('should keep the page usable when the UNSD list fails', async () => {
    fetchAdminCountryOptionsMock.mockRejectedValue(new Error('UNSD is offline'));
    renderWithQueryClient();
    fireEvent.click(screen.getByRole('button', { name: 'Add country' }));

    await waitFor(() => {
      expect(screen.getByText('The country list could not be loaded from UNSD.')).toBeVisible();
    });
    expect(screen.getByText('ES')).toBeInTheDocument();
  });
});
