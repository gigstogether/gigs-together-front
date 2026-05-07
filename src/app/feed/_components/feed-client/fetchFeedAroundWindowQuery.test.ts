import { QueryClient } from '@tanstack/react-query';

import type { V1GigAroundGetResponseBody } from '@/lib/types';

import type { FetchFeedAroundParams } from './feedApi';
import { feedAroundWindowQueryOptions } from './fetchFeedAroundWindowQuery';

const { fetchFeedAroundWindowMock } = vi.hoisted(() => ({
  fetchFeedAroundWindowMock:
    vi.fn<(params: FetchFeedAroundParams) => Promise<V1GigAroundGetResponseBody>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedAroundWindow: fetchFeedAroundWindowMock,
}));

function createEmptyAroundBody(): V1GigAroundGetResponseBody {
  return {
    before: [],
    after: [],
    prevCursor: undefined,
    nextCursor: undefined,
  };
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

describe('feedAroundWindowQueryOptions', () => {
  beforeEach(() => {
    fetchFeedAroundWindowMock.mockReset();
  });

  it('should dedupe concurrent fetchQuery calls when request key matches', async () => {
    const queryClient = createTestQueryClient();
    const body = createEmptyAroundBody();
    fetchFeedAroundWindowMock.mockResolvedValue(body);

    const baseParams = {
      country: 'es',
      city: 'barcelona',
      anchorYmd: '2026-05-01',
      beforeLimit: 10,
      afterLimit: 10,
    };
    const options = feedAroundWindowQueryOptions(baseParams);
    const first = queryClient.fetchQuery(options);
    const second = queryClient.fetchQuery(options);
    const [firstBody, secondBody] = await Promise.all([first, second]);

    expect(firstBody).toBe(body);
    expect(secondBody).toBe(body);
    expect(fetchFeedAroundWindowMock).toHaveBeenCalledTimes(1);
  });

  it('should call fetch once per distinct anchorYmd when cache is cold', async () => {
    const queryClient = createTestQueryClient();
    const firstBody = createEmptyAroundBody();
    const secondBody: V1GigAroundGetResponseBody = {
      ...createEmptyAroundBody(),
      nextCursor: 'c2',
    };
    fetchFeedAroundWindowMock.mockResolvedValueOnce(firstBody);
    fetchFeedAroundWindowMock.mockResolvedValueOnce(secondBody);

    const shared = { country: 'es', city: 'barcelona', beforeLimit: 5, afterLimit: 5 };
    const a = await queryClient.fetchQuery(
      feedAroundWindowQueryOptions({ ...shared, anchorYmd: '2026-01-01' }),
    );
    const b = await queryClient.fetchQuery(
      feedAroundWindowQueryOptions({ ...shared, anchorYmd: '2026-06-01' }),
    );

    expect(a.nextCursor).toBeUndefined();
    expect(b.nextCursor).toBe('c2');
    expect(fetchFeedAroundWindowMock).toHaveBeenCalledTimes(2);
  });
});
