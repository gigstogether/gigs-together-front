import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAdminTranslationsMutations } from '@/app/admin/translations/use-admin-translations-mutations';

const mockPutAdminTranslation = vi.fn();
const mockPatchAdminTranslationActive = vi.fn();

vi.mock('@/lib/admin-api', () => ({
  putAdminTranslation: (...args: unknown[]) => mockPutAdminTranslation(...args),
  patchAdminTranslationActive: (...args: unknown[]) => mockPatchAdminTranslationActive(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper(props: { readonly children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
  };
}

describe('useAdminTranslationsMutations', () => {
  beforeEach(() => {
    mockPutAdminTranslation.mockReset();
    mockPatchAdminTranslationActive.mockReset();

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

  it('should upsert translation when upsert is called', async () => {
    const { result } = renderHook(
      () => useAdminTranslationsMutations({ namespaceFilter: 'about' }),
      { wrapper: createWrapper() },
    );

    result.current.upsert({
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About us',
      format: 'plain',
      kind: 'text',
      isActive: true,
    });

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

  it('should toggle translation active status when setActive is called', async () => {
    const { result } = renderHook(
      () => useAdminTranslationsMutations({ namespaceFilter: 'about' }),
      { wrapper: createWrapper() },
    );

    result.current.setActive({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      isActive: false,
    });

    await waitFor(() => {
      expect(mockPatchAdminTranslationActive).toHaveBeenCalledWith('64f1a2b3c4d5e6f7a8b9c0d1', {
        isActive: false,
      });
    });
  });
});
