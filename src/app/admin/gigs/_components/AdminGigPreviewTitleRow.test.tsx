import { render } from '@testing-library/react';
import { Link as LinkIcon } from 'lucide-react';

const { mockCopyToClipboardButton } = vi.hoisted(() => ({
  mockCopyToClipboardButton: vi.fn(),
}));

vi.mock('@/components/CopyToClipboardButton', () => ({
  default: (props: { icon?: unknown }) => {
    mockCopyToClipboardButton(props);
    return <button type="button">Copy link</button>;
  },
}));

import AdminGigPreviewTitleRow from '@/app/admin/gigs/_components/AdminGigPreviewTitleRow';
import { GigStatusAPI } from '@/app/admin/gigs/types';

describe('AdminGigPreviewTitleRow', () => {
  beforeEach(() => {
    mockCopyToClipboardButton.mockReset();
  });

  it('should pass the link icon to the copy button', () => {
    render(
      <AdminGigPreviewTitleRow
        title="Radiohead"
        sharePath="/admin/gigs/radiohead-barcelona"
        status={GigStatusAPI.Approved}
      />,
    );

    expect(mockCopyToClipboardButton).toHaveBeenCalledTimes(1);
    expect(mockCopyToClipboardButton.mock.calls[0]?.[0].icon).toBe(LinkIcon);
  });
});
