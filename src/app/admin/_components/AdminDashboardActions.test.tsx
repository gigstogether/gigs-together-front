import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminDashboardActions from '@/app/admin/_components/AdminDashboardActions';

const mockPublishDigestAsync = vi.fn();
const mockRevalidateFeed = vi.fn();
const mockRevalidateTranslations = vi.fn();

vi.mock('@/app/admin/_hooks/use-admin-dashboard-actions', () => ({
  useAdminDashboardActions: () => ({
    isPublishingDigest: false,
    isRevalidatingFeed: false,
    isRevalidatingTranslations: false,
    publishDigestAsync: mockPublishDigestAsync,
    revalidateFeed: mockRevalidateFeed,
    revalidateTranslations: mockRevalidateTranslations,
  }),
}));

describe('AdminDashboardActions', () => {
  beforeEach(() => {
    mockPublishDigestAsync.mockReset();
    mockRevalidateFeed.mockReset();
    mockRevalidateTranslations.mockReset();
    mockPublishDigestAsync.mockResolvedValue(undefined);
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

  it('should require confirmation before publishing digest', async () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Publish digest' }));

    expect(mockPublishDigestAsync).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Publish weekly digest?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, publish now' }));

    await waitFor(() => {
      expect(mockPublishDigestAsync).toHaveBeenCalledOnce();
    });
  });

  it('should close confirm dialog after digest publish succeeds', async () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Publish digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, publish now' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Publish weekly digest?' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should keep confirm dialog open when digest publish fails', async () => {
    mockPublishDigestAsync.mockRejectedValue(new Error('fail'));
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Publish digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, publish now' }));

    await waitFor(() => {
      expect(mockPublishDigestAsync).toHaveBeenCalledOnce();
    });
    expect(screen.getByRole('heading', { name: 'Publish weekly digest?' })).toBeInTheDocument();
  });

  it('should not publish digest when confirmation is cancelled', () => {
    render(<AdminDashboardActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Publish digest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPublishDigestAsync).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Publish weekly digest?' }),
    ).not.toBeInTheDocument();
  });
});
