import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import AdminCommunitiesPageClient from './AdminCommunitiesPageClient';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

const api = vi.hoisted(() => ({
  fetch: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  countries: vi.fn(),
  translations: vi.fn(),
}));
vi.mock('../_lib/admin-communities-api', () => ({
  fetchAdminCommunities: api.fetch,
  createAdminCommunity: api.create,
  updateAdminCommunity: api.update,
}));
vi.mock('@/lib/countries', () => ({ fetchCountries: api.countries }));
vi.mock('@/app/admin/_lib/admin-api', () => ({ fetchAdminTranslations: api.translations }));

const COMMUNITY = {
  id: 'community-1',
  countryIso: 'ES',
  slug: 'barcelona',
  nameTranslationKey: 'barcelona.name',
  timeZone: 'Europe/Madrid',
  isActive: true,
};

describe('AdminCommunitiesPageClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    stubResizeObserver();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    api.fetch.mockResolvedValue([
      COMMUNITY,
      {
        ...COMMUNITY,
        id: 'community-2',
        slug: 'girona',
        nameTranslationKey: 'girona.name',
        isActive: false,
      },
    ]);
    api.countries.mockResolvedValue([{ iso: 'ES' }]);
    api.translations.mockResolvedValue([
      { key: 'barcelona.name', value: 'Barcelona', format: 'plain', kind: 'text', isActive: true },
      { key: 'girona.name', value: 'Girona', format: 'plain', kind: 'text', isActive: true },
    ]);
    api.update.mockResolvedValue(COMMUNITY);
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  function renderPage(): void {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminCommunitiesPageClient />
      </QueryClientProvider>,
    );
  }

  it('should show active and inactive Communities when loading succeeds', async () => {
    renderPage();
    expect(
      await screen.findByRole('button', { name: 'Edit community Barcelona' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit community Girona' })).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should filter Communities when searching by translated name', async () => {
    renderPage();
    await screen.findByRole('button', { name: 'Edit community Barcelona' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search communities' }), {
      target: { value: 'Girona' },
    });
    expect(
      screen.queryByRole('button', { name: 'Edit community Barcelona' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit community Girona' })).toBeInTheDocument();
  });

  it('should open a creation modal when adding a Community', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'New community' }));
    expect(screen.getByRole('dialog', { name: 'New community' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create community' })).toBeDisabled();
  });

  it('should save through the edit modal and reload the list when saving succeeds', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Edit community Barcelona' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit community' });
    fireEvent.change(within(dialog).getByLabelText('Slug:*'), {
      target: { value: 'new-barcelona' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(COMMUNITY.id, {
        countryIso: 'ES',
        slug: 'new-barcelona',
        nameTranslationKey: 'barcelona.name',
        timeZone: 'Europe/Madrid',
        isActive: true,
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.fetch.mock.calls.length).toBeGreaterThan(1);
  });

  it('should report a load failure instead of an empty catalog when the request fails', async () => {
    api.fetch.mockRejectedValue(new Error('Unavailable'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load communities');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('No communities found.')).not.toBeInTheDocument();
  });
});
