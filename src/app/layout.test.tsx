import type { PropsWithChildren } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('server-only', () => ({}));

vi.mock('@/env/server-env', () => ({
  serverEnv: {
    appBaseUrl: 'https://gigstogether.com',
    brandName: 'Gigs Together!',
    sitePreviewTitle: 'Existing preview title',
    sitePreviewDescription: 'Find gigs and company in your city.',
    isDevelopment: false,
    isStaging: false,
    isProductionSite: true,
  },
}));

vi.mock('@/providers/PlausibleAnalyticsProvider', () => ({
  default: (props: PropsWithChildren) => <>{props.children}</>,
}));

vi.mock('@/providers/QueryProvider', () => ({
  QueryProvider: (props: PropsWithChildren) => <>{props.children}</>,
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => null,
}));

import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('should render the preferred and alternative site names in structured data', async () => {
    const element = await RootLayout({ children: <main /> });

    const html = renderToStaticMarkup(element);

    expect(html).toContain(
      '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Gigs Together!","alternateName":["Gigs Together","GigsTogether"],"url":"https://gigstogether.com"}</script>',
    );
  });
});
