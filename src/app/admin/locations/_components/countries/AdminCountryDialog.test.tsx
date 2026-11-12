import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import AdminCountryDialog from './AdminCountryDialog';

const fetchAdminCountryOptionsMock = vi.fn();
const createAdminCountryMock = vi.fn();

vi.mock('../../_lib/admin-countries-api', () => ({
  fetchAdminCountryOptions: () => fetchAdminCountryOptionsMock(),
  createAdminCountry: (...args: unknown[]) => createAdminCountryMock(...args),
}));

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminCountryDialog onOpenChange={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe('AdminCountryDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchAdminCountryOptionsMock.mockResolvedValue([
      { iso: 'FR', isConfigured: false },
      { iso: 'ES', isConfigured: true },
    ]);
    createAdminCountryMock.mockResolvedValue({ iso: 'FR' });
  });

  it('should show localized country options with ISO codes', async () => {
    renderDialog();

    expect(await screen.findByText('France')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Spain/ })).toBeDisabled();
    expect(within(screen.getByRole('dialog')).getByText('ES · Already added')).toBeVisible();
  });

  it('should add the selected country', async () => {
    renderDialog();
    await screen.findByText('France');

    fireEvent.click(screen.getByRole('button', { name: /France/ }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Add country' }),
    );

    await waitFor(() => {
      expect(createAdminCountryMock).toHaveBeenCalledWith({ iso: 'FR' }, expect.anything());
    });
  });

  it('should show an error when the UNSD list cannot be loaded', async () => {
    fetchAdminCountryOptionsMock.mockRejectedValue(new Error('UNSD is offline'));

    renderDialog();

    expect(
      await screen.findByText('The country list could not be loaded from UNSD.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });
});
