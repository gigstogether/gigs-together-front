import { notFound, redirect } from 'next/navigation';

import { handleMissingFeedCommunity } from './community-feed-navigation.server';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

describe('handleMissingFeedCommunity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return not found without redirecting when the requested Community is unavailable', () => {
    expect(() => handleMissingFeedCommunity()).toThrow(new Error('NEXT_NOT_FOUND'));
    expect(notFound).toHaveBeenCalledOnce();
    expect(redirect).not.toHaveBeenCalled();
  });
});
