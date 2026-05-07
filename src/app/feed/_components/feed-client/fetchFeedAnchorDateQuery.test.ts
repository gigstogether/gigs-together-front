import type { FetchFeedAnchorYmdByPublicIdParams } from './feedApi';
import { feedAnchorDateByPublicIdQueryOptions } from './fetchFeedAnchorDateQuery';
import { createTestQueryClient } from '@/test-utils/react-query-client';

const { fetchFeedAnchorYmdByPublicIdMock } = vi.hoisted(() => ({
  fetchFeedAnchorYmdByPublicIdMock:
    vi.fn<(params: FetchFeedAnchorYmdByPublicIdParams) => Promise<string>>(),
}));

vi.mock('./feedApi', () => ({
  fetchFeedAnchorYmdByPublicId: fetchFeedAnchorYmdByPublicIdMock,
}));

describe('feedAnchorDateByPublicIdQueryOptions', () => {
  beforeEach(() => {
    fetchFeedAnchorYmdByPublicIdMock.mockReset();
  });

  it('should dedupe concurrent fetchQuery calls when publicId matches', async () => {
    const queryClient = createTestQueryClient();
    fetchFeedAnchorYmdByPublicIdMock.mockResolvedValueOnce('2026-05-01');

    const options = feedAnchorDateByPublicIdQueryOptions('gig-public-1');
    const first = queryClient.fetchQuery(options);
    const second = queryClient.fetchQuery(options);
    const [firstYmd, secondYmd] = await Promise.all([first, second]);

    expect(firstYmd).toBe('2026-05-01');
    expect(secondYmd).toBe('2026-05-01');
    expect(fetchFeedAnchorYmdByPublicIdMock).toHaveBeenCalledTimes(1);
  });

  it('should call fetch once per distinct publicId when cache is cold', async () => {
    const queryClient = createTestQueryClient();
    fetchFeedAnchorYmdByPublicIdMock.mockImplementation(async (params) => {
      return params.publicId === 'a' ? '2026-01-01' : '2026-06-01';
    });

    const firstYmd = await queryClient.fetchQuery(feedAnchorDateByPublicIdQueryOptions('a'));
    const secondYmd = await queryClient.fetchQuery(feedAnchorDateByPublicIdQueryOptions('b'));

    expect(firstYmd).toBe('2026-01-01');
    expect(secondYmd).toBe('2026-06-01');
    expect(fetchFeedAnchorYmdByPublicIdMock).toHaveBeenCalledTimes(2);
  });
});
