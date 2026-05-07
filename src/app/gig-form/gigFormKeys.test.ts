import { gigFormKeys } from './gigFormKeys';

describe('gigFormKeys', () => {
  it('should build a root key for gig-form invalidation', () => {
    expect(gigFormKeys.all()).toEqual(['gig-form']);
  });

  it('should build a stable edit key and trim the public id', () => {
    expect(gigFormKeys.editByPublicId('  my-gig-id  ')).toEqual([
      'gig-form',
      'edit-gig',
      'my-gig-id',
    ]);
  });
});
