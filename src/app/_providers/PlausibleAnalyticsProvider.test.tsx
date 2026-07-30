import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PlausibleAnalyticsProvider from '@/app/_providers/PlausibleAnalyticsProvider';

const PlausibleProviderMock = vi.hoisted(() =>
  vi.fn(({ children }: { children: ReactNode }) => <div data-testid="plausible">{children}</div>),
);

vi.mock('next-plausible', () => ({
  default: PlausibleProviderMock,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    plausibleScriptSrc: 'https://plausible.io/js/example.js',
  },
}));

vi.mock('@/env/server-env', () => ({
  serverEnv: {
    isProductionSite: true,
  },
}));

describe('PlausibleAnalyticsProvider', () => {
  beforeEach(() => {
    PlausibleProviderMock.mockClear();
  });

  it('should render children without Plausible on non-production deployments', async () => {
    vi.resetModules();
    vi.doMock('@/env/server-env', () => ({
      serverEnv: {
        isProductionSite: false,
      },
    }));

    const providerModule = await import('@/app/_providers/PlausibleAnalyticsProvider');
    const html = renderToStaticMarkup(
      <providerModule.default>
        <span>content</span>
      </providerModule.default>,
    );

    expect(html).toBe('<span>content</span>');
    expect(PlausibleProviderMock).not.toHaveBeenCalled();
  });

  it('should render children without Plausible when script src is not configured', async () => {
    vi.resetModules();
    vi.doMock('@/env/client-env', () => ({
      clientEnv: {
        plausibleScriptSrc: undefined,
      },
    }));
    vi.doMock('@/env/server-env', () => ({
      serverEnv: {
        isProductionSite: true,
      },
    }));

    const providerModule = await import('@/app/_providers/PlausibleAnalyticsProvider');
    const html = renderToStaticMarkup(
      <providerModule.default>
        <span>content</span>
      </providerModule.default>,
    );

    expect(html).toBe('<span>content</span>');
    expect(PlausibleProviderMock).not.toHaveBeenCalled();
  });

  it('should wrap children with Plausible on production when script src is configured', () => {
    const html = renderToStaticMarkup(
      <PlausibleAnalyticsProvider>
        <span>content</span>
      </PlausibleAnalyticsProvider>,
    );

    expect(html).toContain('content');
    expect(PlausibleProviderMock).toHaveBeenCalledOnce();
  });
});
