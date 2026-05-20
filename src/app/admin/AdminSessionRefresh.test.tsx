// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';

import AdminSessionRefresh from '@/app/admin/AdminSessionRefresh';
import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';

const mockInvalidateAuthMeQuery = vi.fn();

vi.mock('@/lib/auth-me', () => ({
  invalidateAuthMeQuery: (...args: unknown[]) => mockInvalidateAuthMeQuery(...args),
}));

describe('AdminSessionRefresh', () => {
  beforeEach(() => {
    mockInvalidateAuthMeQuery.mockReset();
    mockInvalidateAuthMeQuery.mockResolvedValue(undefined);
  });

  it('should invalidate auth me query on mount', async () => {
    const queryClient = createTestQueryClient();

    render(<AdminSessionRefresh />, {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockInvalidateAuthMeQuery).toHaveBeenCalledWith(queryClient);
    });
  });
});
