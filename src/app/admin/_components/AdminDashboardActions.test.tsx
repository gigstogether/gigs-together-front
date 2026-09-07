import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminDashboardActions from '@/app/admin/_components/AdminDashboardActions';

const mockPostDigestAsync = vi.fn();
const mockRevalidateFeed = vi.fn();
const mockRevalidateTranslations = vi.fn();

vi.mock('@/app/admin/_hooks/use-admin-dashboard-actions', () => ({
  useAdminDashboardActions: () => ({
    isPostingDigest: false,
    isRevalidatingFeed: false,
    isRevalidatingTranslations: false,
    postDigestAsync: mockPostDigestAsync,
    revalidateFeed: mockRevalidateFeed,
    revalidateTranslations: mockRevalidateTranslations,
  }),
}));

describe('AdminDashboardActions', () => {
  beforeEach(() => {
    mockPostDigestAsync.mockReset();
    mockRevalidateFeed.mockReset();
    mockRevalidateTranslations.mockReset();
    mockPostDigestAsync.mockResolvedValue(undefined);
    mockRevalidateFeed.mockResolvedValue(undefined);
    mockRevalidateTranslations.mockResolvedValue(undefined);
  });

  it('should call revalidate translations immediately when button is clicked', () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Revalidate translations' }));

    expect(mockRevalidateTranslations).toHaveBeenCalledOnce();
  });

  it('should call revalidate feed immediately when button is clicked', () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Revalidate feed' }));

    expect(mockRevalidateFeed).toHaveBeenCalledOnce();
  });

  it('should require confirmation before posting the digest', async () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Post digest' }));

    expect(mockPostDigestAsync).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Post weekly digest?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, post now' }));

    await waitFor(() => {
      expect(mockPostDigestAsync).toHaveBeenCalledOnce();
    });
  });

  it('should close the confirmation dialog after digest posting succeeds', async () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Post digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, post now' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Post weekly digest?' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should keep the confirmation dialog open when digest posting fails', async () => {
    mockPostDigestAsync.mockRejectedValue(new Error('fail'));
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Post digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, post now' }));

    await waitFor(() => {
      expect(mockPostDigestAsync).toHaveBeenCalledOnce();
    });
    expect(screen.getByRole('heading', { name: 'Post weekly digest?' })).toBeInTheDocument();
  });

  it('should not post the digest when confirmation is cancelled', () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Post digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPostDigestAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Post weekly digest?' })).not.toBeInTheDocument();
  });
});
