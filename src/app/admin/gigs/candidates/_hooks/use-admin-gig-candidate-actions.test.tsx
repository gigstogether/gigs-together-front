// @vitest-environment jsdom

import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';

import type {
  approveAdminGigCandidate,
  rejectAdminGigCandidate,
  sendAdminGigCandidateToModeration,
} from '@/app/admin/_lib/admin-api';
import { useAdminGigCandidateActions } from '@/app/admin/gigs/candidates/_hooks/use-admin-gig-candidate-actions';
import type { AdminGigCandidate } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { approveGigCandidateMock, rejectGigCandidateMock, sendGigCandidateToModerationMock } =
  vi.hoisted(() => ({
    approveGigCandidateMock: vi.fn<typeof approveAdminGigCandidate>(),
    rejectGigCandidateMock: vi.fn<typeof rejectAdminGigCandidate>(),
    sendGigCandidateToModerationMock: vi.fn<typeof sendAdminGigCandidateToModeration>(),
  }));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  approveAdminGigCandidate: approveGigCandidateMock,
  rejectAdminGigCandidate: rejectGigCandidateMock,
  sendAdminGigCandidateToModeration: sendGigCandidateToModerationMock,
}));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

function renderActions() {
  return renderHook(
    () =>
      useAdminGigCandidateActions({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 7,
      }),
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

const responseGigCandidate: AdminGigCandidate = {
  id: 'gigCandidate-42',
  source: { type: 'user', userId: 'user-7', origin: { type: 'admin' } },
  gigDraft: {},
  status: GigCandidateStatusAPI.Reviewing,
  version: 8,
  createdAt: '2026-08-25T08:00:00.000Z',
  updatedAt: '2026-08-25T08:01:00.000Z',
};

describe('useAdminGigCandidateActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send the loaded GigCandidate version to moderation', async () => {
    sendGigCandidateToModerationMock.mockResolvedValueOnce(responseGigCandidate);
    const { result } = renderActions();

    act(() => result.current.sendGigCandidateToModeration());

    await waitFor(() => {
      expect(sendGigCandidateToModerationMock).toHaveBeenCalledWith({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 7,
      });
    });
  });

  it('should reject the loaded GigCandidate version', async () => {
    rejectGigCandidateMock.mockResolvedValueOnce({
      ...responseGigCandidate,
      status: GigCandidateStatusAPI.Rejected,
    });
    const { result } = renderActions();

    act(() => result.current.rejectGigCandidate());

    await waitFor(() => {
      expect(rejectGigCandidateMock).toHaveBeenCalledWith({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 7,
      });
    });
  });

  it('should approve the loaded GigCandidate version', async () => {
    approveGigCandidateMock.mockResolvedValueOnce({
      ...responseGigCandidate,
      status: GigCandidateStatusAPI.Approved,
    });
    const { result } = renderActions();

    act(() => result.current.approveGigCandidate());

    await waitFor(() => {
      expect(approveGigCandidateMock).toHaveBeenCalledWith({
        gigCandidateId: 'gigCandidate-42',
        expectedVersion: 7,
      });
    });
  });
});
