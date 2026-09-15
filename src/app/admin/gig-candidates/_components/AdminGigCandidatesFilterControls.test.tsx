// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigCandidatesFilterControls from '@/app/admin/gig-candidates/_components/AdminGigCandidatesFilterControls';
import { GigCandidateStatusFilter } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';

describe('AdminGigCandidatesFilterControls', () => {
  it('should show every short label on mobile and retain compact desktop filters', () => {
    render(
      <AdminGigCandidatesFilterControls
        filter={GigCandidateStatusFilter.New}
        onFilterChange={vi.fn()}
        trailingAction={<button type="button">Create Gig Candidate</button>}
      />,
    );

    const newButton = screen.getByRole('button', { name: 'New' });
    const reviewingButton = screen.getByRole('button', { name: 'Reviewing' });
    const approvedButton = screen.getByRole('button', { name: 'Approved' });
    const rejectedButton = screen.getByRole('button', { name: 'Rejected' });
    expect(newButton).toHaveTextContent('New');
    expect(reviewingButton).toHaveTextContent('Rev');
    expect(approvedButton).toHaveTextContent('App');
    expect(rejectedButton).toHaveTextContent('Rej');
    expect(screen.getByText('App')).toHaveClass('sm:hidden');
    expect(screen.getByText('Rej')).toHaveClass('sm:hidden');
    expect(screen.getByText('New')).not.toHaveClass('sm:hidden');
    expect(screen.getByText('Rev')).not.toHaveClass('sm:hidden');
    expect(newButton).toHaveClass('sm:flex-1', 'sm:px-1');
    expect(reviewingButton).toHaveClass('sm:flex-1', 'sm:px-1');
    expect(approvedButton).toHaveClass('sm:w-8', 'sm:flex-none', 'sm:px-0');
    expect(rejectedButton).toHaveClass('sm:w-8', 'sm:flex-none', 'sm:px-0');
    expect(newButton).toHaveAttribute('title', 'New');
    expect(reviewingButton).toHaveAttribute('title', 'Reviewing');
    expect(approvedButton).toHaveAttribute('title', 'Approved');
    expect(rejectedButton).toHaveAttribute('title', 'Rejected');
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
