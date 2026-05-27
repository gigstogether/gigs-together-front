import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminLanguagesPageClient from '@/app/admin/AdminLanguagesPageClient';

const mockFetchAdminLanguages = vi.fn();
const mockPatchAdminLanguage = vi.fn();
const mockPatchAdminLanguagesOrder = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  fetchAdminLanguages: () => mockFetchAdminLanguages(),
  patchAdminLanguage: (...args: unknown[]) => mockPatchAdminLanguage(...args),
  patchAdminLanguagesOrder: (...args: unknown[]) => mockPatchAdminLanguagesOrder(...args),
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
      <AdminLanguagesPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminLanguagesPageClient', () => {
  beforeEach(() => {
    mockFetchAdminLanguages.mockReset();
    mockPatchAdminLanguage.mockReset();
    mockPatchAdminLanguagesOrder.mockReset();
    mockFetchAdminLanguages.mockResolvedValue([
      { iso: 'en', name: 'English', isActive: true, order: 0 },
      { iso: 'es', name: 'Español', isActive: true, order: 1 },
    ]);
    mockPatchAdminLanguage.mockResolvedValue({
      iso: 'es',
      name: 'Español',
      isActive: false,
      order: 1,
    });
    mockPatchAdminLanguagesOrder.mockResolvedValue([
      { iso: 'es', name: 'Español', isActive: true, order: 0 },
      { iso: 'en', name: 'English', isActive: true, order: 1 },
    ]);
  });

  it('should render languages list when data is loaded', async () => {
    renderWithQueryClient();

    expect(screen.getByText('Languages')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Español')).toBeInTheDocument();
      expect(screen.getByLabelText('Order for en')).toHaveTextContent('0');
      expect(screen.getByLabelText('Order for es')).toHaveTextContent('1');
    });
  });

  it('should toggle language active status when switch is clicked', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getAllByRole('switch')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Active for es' }));

    await waitFor(() => {
      expect(mockPatchAdminLanguage).toHaveBeenCalledWith('es', { isActive: false });
    });
  });

  it('should reorder languages when an item is dropped onto another item', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByLabelText('Reorder en')).toBeInTheDocument();
    });

    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
      getData: vi.fn(),
    };

    fireEvent.dragStart(screen.getByLabelText('Reorder es'), { dataTransfer });
    fireEvent.dragOver(screen.getByLabelText('Language en'), { dataTransfer });
    fireEvent.drop(screen.getByLabelText('Language en'), { dataTransfer });

    await waitFor(() => {
      expect(mockPatchAdminLanguagesOrder).toHaveBeenCalledWith(
        [
          { iso: 'es', order: 0 },
          { iso: 'en', order: 1 },
        ],
        expect.anything(),
      );
    });
  });
});
