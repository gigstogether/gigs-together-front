import { feedAroundQueryOptions } from './fetchFeedAroundQuery';
import { createTestQueryClient } from '@/test/react-query-client';
import type { V1GigAroundGetResponseBody } from '@/lib/types';

interface FetchFeedAroundCallParams {
  readonly anchorYmd: string;
  readonly beforeLimit: number;
  readonly afterLimit: number;
  readonly country?: string;
  readonly city?: string;
  readonly signal?: AbortSignal;
}

const { fetchFeedAroundMock } = vi.hoisted(() => ({
  fetchFeedAroundMock:
    vi.fn<(params: FetchFeedAroundCallParams) => Promise<V1GigAroundGetResponseBody>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedAround: fetchFeedAroundMock,
}));

const emptyAroundBody = (): V1GigAroundGetResponseBody => ({
  before: [],
  after: [],
});

describe('feedAroundQueryOptions', () => {
  beforeEach(() => {
    fetchFeedAroundMock.mockReset();
  });

  it('should dedupe concurrent fetchQuery calls when query key matches', async () => {
    const queryClient = createTestQueryClient();
    fetchFeedAroundMock.mockResolvedValueOnce(emptyAroundBody());

    const options = feedAroundQueryOptions({
      country: 'es',
      city: 'barcelona',
      anchorYmd: '2026-05-01',
      beforeLimit: 10,
      afterLimit: 10,
    });
    const first = queryClient.fetchQuery(options);
    const second = queryClient.fetchQuery(options);
    await Promise.all([first, second]);

    expect(fetchFeedAroundMock).toHaveBeenCalledTimes(1);
  });

  it('should call fetch once per distinct key when cache is cold', async () => {
    const queryClient = createTestQueryClient();
    fetchFeedAroundMock.mockImplementation(async (params) => {
      return params.anchorYmd === '2026-01-01'
        ? { before: [], after: [], prevCursor: 'p1' }
        : { before: [], after: [], nextCursor: 'n2' };
    });

    const a = await queryClient.fetchQuery(
      feedAroundQueryOptions({
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-01-01',
        beforeLimit: 10,
        afterLimit: 10,
      }),
    );
    const b = await queryClient.fetchQuery(
      feedAroundQueryOptions({
        country: 'es',
        city: 'barcelona',
        anchorYmd: '2026-06-01',
        beforeLimit: 10,
        afterLimit: 10,
      }),
    );

    expect(a.prevCursor).toBe('p1');
    expect(b.nextCursor).toBe('n2');
    expect(fetchFeedAroundMock).toHaveBeenCalledTimes(2);
  });
});
