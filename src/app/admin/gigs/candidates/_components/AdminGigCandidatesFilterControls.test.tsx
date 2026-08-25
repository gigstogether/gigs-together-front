// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigCandidatesFilterControls from '@/app/admin/gigs/candidates/_components/AdminGigCandidatesFilterControls';
import { GigCandidateStatusFilter } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

describe('AdminGigCandidatesFilterControls', () => {
  it('should render status dots with text only for the first two statuses', () => {
    render(
      <AdminGigCandidatesFilterControls
        filter={GigCandidateStatusFilter.New}
        onFilterChange={vi.fn()}
        trailingAction={<button type="button">Create Gig Candidate</button>}
      />,
    );

    const newButton = screen.getByRole('button', { name: 'New' });
    const reviewingButton = screen.getByRole('button', { name: 'Rev' });
    const approvedButton = screen.getByRole('button', { name: 'Approved' });
    const rejectedButton = screen.getByRole('button', { name: 'Rejected' });
    expect(newButton).toHaveTextContent('New');
    expect(reviewingButton).toHaveTextContent('Rev');
    expect(newButton).toHaveAttribute('title', 'New');
    expect(reviewingButton).toHaveAttribute('title', 'Reviewing');
    expect(approvedButton).not.toHaveTextContent('Approved');
    expect(rejectedButton).not.toHaveTextContent('Rejected');
    expect(newButton.querySelector('span')).toHaveClass('bg-slate-500');
    expect(reviewingButton.querySelector('span')).toHaveClass('bg-yellow-500');
    expect(approvedButton.querySelector('span')).toHaveClass('bg-emerald-500');
    expect(rejectedButton.querySelector('span')).toHaveClass('bg-rose-500');
    expect(approvedButton.querySelector('svg')).not.toBeInTheDocument();
    expect(rejectedButton.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Gig Candidate' })).toBeInTheDocument();
  });

  it('should report the selected GigCandidate status', () => {
    const onFilterChange = vi.fn();
    render(
      <AdminGigCandidatesFilterControls
        filter={GigCandidateStatusFilter.New}
        onFilterChange={onFilterChange}
        trailingAction={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Approved' }));

    expect(onFilterChange).toHaveBeenCalledWith(GigCandidateStatusFilter.Approved);
  });
});
