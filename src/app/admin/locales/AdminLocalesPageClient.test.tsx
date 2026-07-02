import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminLocalesPageClient from '@/app/admin/locales/AdminLocalesPageClient';

const mockFetchAdminLocales = vi.fn();
const mockPatchAdminLocale = vi.fn();
const mockPatchAdminLocalesOrder = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  fetchAdminLocales: () => mockFetchAdminLocales(),
  patchAdminLocale: (...args: unknown[]) => mockPatchAdminLocale(...args),
  patchAdminLocalesOrder: (...args: unknown[]) => mockPatchAdminLocalesOrder(...args),
}));

function mockPointerCapture(element: HTMLElement) {
  const capturedPointerIds = new Set<number>();
  element.setPointerCapture = vi.fn((pointerId: number) => {
    capturedPointerIds.add(pointerId);
  });
  element.releasePointerCapture = vi.fn((pointerId: number) => {
    capturedPointerIds.delete(pointerId);
  });
  element.hasPointerCapture = vi.fn((pointerId: number) => capturedPointerIds.has(pointerId));
}

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminLocalesPageClient />
    </QueryClientProvider>,
  );
}

describe('AdminLocalesPageClient', () => {
  beforeEach(() => {
    mockFetchAdminLocales.mockReset();
    mockPatchAdminLocale.mockReset();
    mockPatchAdminLocalesOrder.mockReset();
    mockFetchAdminLocales.mockResolvedValue([
      { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
      { iso: 'es', nativeName: 'Español', isActive: true, order: 1 },
    ]);
    mockPatchAdminLocale.mockResolvedValue({
      iso: 'es',
      nativeName: 'Español',
      isActive: false,
      order: 1,
    });
    mockPatchAdminLocalesOrder.mockResolvedValue([
      { iso: 'es', nativeName: 'Español', isActive: true, order: 0 },
      { iso: 'en', nativeName: 'English', isActive: true, order: 1 },
    ]);
  });

  it('should render locales list when data is loaded', async () => {
    renderWithQueryClient();

    expect(screen.getByText('Locales')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Español')).toBeInTheDocument();
      expect(screen.getByLabelText('Order for en')).toHaveTextContent('0');
      expect(screen.getByLabelText('Order for es')).toHaveTextContent('1');
    });
  });

  it('should toggle locale active status when switch is clicked', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getAllByRole('switch')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Active for es' }));

    await waitFor(() => {
      expect(mockPatchAdminLocale).toHaveBeenCalledWith('es', { isActive: false });
    });
  });

  it('should reorder locales when an item is dropped onto another item', async () => {
    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByLabelText('Reorder en')).toBeInTheDocument();
    });

    const reorderHandle = screen.getByLabelText('Reorder es');
    const targetItem = screen.getByLabelText('Locale en');
    mockPointerCapture(reorderHandle);
    document.elementFromPoint = vi.fn().mockReturnValue(targetItem);

    fireEvent.pointerDown(reorderHandle, { isPrimary: true, button: 0, pointerId: 1 });
    fireEvent.pointerMove(reorderHandle, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(reorderHandle, { pointerId: 1, clientX: 10, clientY: 10 });

    await waitFor(() => {
      expect(mockPatchAdminLocalesOrder).toHaveBeenCalledWith(
        [
          { iso: 'es', order: 0 },
          { iso: 'en', order: 1 },
        ],
        expect.anything(),
      );
    });
  });
});
