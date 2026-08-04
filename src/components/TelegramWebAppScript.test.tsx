// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TelegramWebAppScript from '@/components/TelegramWebAppScript';

const isTelegramMiniAppMock = vi.hoisted(() => vi.fn());

vi.mock('next/script', () => ({
  default: function MockScript({ src }: { readonly src: string }) {
    return (
      <div
        data-testid="telegram-web-app-script"
        data-src={src}
      />
    );
  },
}));

vi.mock('@/lib/telegram/telegram-webapp', () => ({
  isTelegramMiniApp: () => isTelegramMiniAppMock(),
}));

describe('TelegramWebAppScript', () => {
  beforeEach(() => {
    isTelegramMiniAppMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not load the telegram web app script in a regular browser', () => {
    isTelegramMiniAppMock.mockReturnValue(false);

    const { container } = render(<TelegramWebAppScript />);

    expect(screen.queryByTestId('telegram-web-app-script')).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('should load the telegram web app script inside a mini app', () => {
    isTelegramMiniAppMock.mockReturnValue(true);

    render(<TelegramWebAppScript />);

    expect(screen.getByTestId('telegram-web-app-script')).toHaveAttribute(
      'data-src',
      'https://telegram.org/js/telegram-web-app.js?56',
    );
  });
});
