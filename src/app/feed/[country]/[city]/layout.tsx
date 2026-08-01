import Header from '@/components/header/Header';
import { HeaderConfigProvider } from '@/app/feed/_providers/HeaderConfigProvider';
import HeaderCalendar from '@/app/feed/_components/HeaderCalendar';
import { normalizeSegment } from '@/lib/feed.routes';

export default async function FeedLayout(props: LayoutProps<'/feed/[country]/[city]'>) {
  const { children, params } = props;
  const { country, city } = await params;

  return (
    <HeaderConfigProvider>
      <Header
        country={normalizeSegment(country)}
        city={normalizeSegment(city)}
      >
        <HeaderCalendar
          country={country}
          city={city}
        />
      </Header>
      {children}
    </HeaderConfigProvider>
  );
}
