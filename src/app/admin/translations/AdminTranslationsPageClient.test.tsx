import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminTranslationsPageClient from '@/app/admin/translations/AdminTranslationsPageClient';
import { stubResizeObserver } from '@/test-utils/moderator-telegram-session-mock';

const mockFetchAdminTranslationNamespaces = vi.fn();
const mockFetchAdminLocales = vi.fn();
const mockFetchAdminTranslations = vi.fn();
const mockPutAdminTranslation = vi.fn();
const mockPatchAdminTranslationActive = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  fetchAdminTranslationNamespaces: (...args: unknown[]) =>
    mockFetchAdminTranslationNamespaces(...args),
  fetchAdminLocales: (...args: unknown[]) => mockFetchAdminLocales(...args),
  fetchAdminTranslations: (...args: unknown[]) => mockFetchAdminTranslations(...args),
  putAdminTranslation: (...args: unknown[]) => mockPutAdminTranslation(...args),
  patchAdminTranslationActive: (...args: unknown[]) => mockPatchAdminTranslationActive(...args),
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
      <AdminTranslationsPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminTranslationsPageClient', () => {
  beforeEach(() => {
    stubResizeObserver();
    mockFetchAdminTranslationNamespaces.mockReset();
    mockFetchAdminLocales.mockReset();
    mockFetchAdminTranslations.mockReset();
    mockPutAdminTranslation.mockReset();
    mockPatchAdminTranslationActive.mockReset();

    mockFetchAdminTranslationNamespaces.mockResolvedValue(['about', 'country']);
    mockFetchAdminLocales.mockResolvedValue([
      { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
      { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
    ]);
    mockFetchAdminTranslations.mockResolvedValue([
      {
        id: '64f1a2b3c4d5e6f7a8b9c0d1',
        namespace: 'about',
        locale: 'en',
        key: 'title',
        value: 'About',
        format: 'plain',
        kind: 'text',
        isActive: true,
      },
    ]);
    mockPutAdminTranslation.mockResolvedValue({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About us',
      format: 'plain',
      kind: 'text',
      isActive: true,
    });
    mockPatchAdminTranslationActive.mockResolvedValue({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About',
      format: 'plain',
      kind: 'text',
      isActive: false,
    });
  });

  it('should load all translations by default', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Namespace' })).toBeEnabled();
      expect(screen.getByRole('columnheader', { name: 'Key' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Namespace' })).toBeInTheDocument();
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 translation.')).toBeInTheDocument();
    });

    expect(mockFetchAdminTranslations).toHaveBeenCalledWith({
      namespace: undefined,
      locale: undefined,
    });
  });

  it('should filter translations when namespace is changed', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Namespace' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Namespace' }));
    fireEvent.click(screen.getByRole('option', { name: 'country' }));

    await waitFor(() => {
      expect(mockFetchAdminTranslations).toHaveBeenCalledWith({
        namespace: 'country',
        locale: undefined,
      });
    });
  });

  it('should open create dialog and submit a new translation', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText('Showing 1 translation.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'New translation' }));

    expect(await screen.findByRole('heading', { name: 'New translation' })).toBeInTheDocument();
    expect(
      screen.getByLabelText('Namespace', { selector: '#translation-form-namespace' }),
    ).toHaveValue('');

    fireEvent.change(
      screen.getByLabelText('Namespace', { selector: '#translation-form-namespace' }),
      {
        target: { value: 'about' },
      },
    );
    fireEvent.change(screen.getByLabelText('Key', { selector: '#translation-form-key' }), {
      target: { value: 'subtitle' },
    });
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: 'About us' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create translation' }));

    await waitFor(() => {
      expect(mockPutAdminTranslation).toHaveBeenCalledWith({
        namespace: 'about',
        locale: 'en',
        key: 'subtitle',
        value: 'About us',
        format: 'plain',
        kind: 'text',
        isActive: true,
      });
    });
  });

  it('should open edit dialog and save changes', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit translation title' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit translation title' }));

    expect(screen.getByRole('heading', { name: 'Edit translation' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: 'About us' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mockPutAdminTranslation).toHaveBeenCalledWith({
        namespace: 'about',
        locale: 'en',
        key: 'title',
        value: 'About us',
        format: 'plain',
        kind: 'text',
        isActive: true,
      });
    });
  });

  it('should toggle translation active status from the table', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Active for title' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Active for title' }));

    await waitFor(() => {
      expect(mockPatchAdminTranslationActive).toHaveBeenCalledWith('64f1a2b3c4d5e6f7a8b9c0d1', {
        isActive: false,
      });
    });
  });
});
