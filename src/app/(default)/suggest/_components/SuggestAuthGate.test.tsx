// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import SuggestAuthGate from '@/app/(default)/suggest/_components/SuggestAuthGate';

const { useTelegramAuthMock } = vi.hoisted(() => ({
  useTelegramAuthMock: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: useTelegramAuthMock,
}));

describe('SuggestAuthGate', () => {
  it('should center the loading state across the available route width', () => {
    useTelegramAuthMock.mockReturnValue({
      authState: undefined,
      isLoadingAuthState: true,
    });

    render(
      <SuggestAuthGate>
        <div>Form</div>
      </SuggestAuthGate>,
    );

    expect(screen.getByText('Loading…').parentElement).toHaveClass('w-full', 'justify-center');
  });
});
