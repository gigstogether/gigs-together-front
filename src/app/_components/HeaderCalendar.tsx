import 'server-only';

import HeaderCalendarClient from '@/app/_components/HeaderCalendarClient';
import { getFeedAvailableDates } from '@/lib/feed.server';

export interface HeaderCalendarProps {
  readonly country: string;
  readonly city: string;
}

export default async function HeaderCalendar(props: HeaderCalendarProps) {
  const { country, city } = props;

  const availableDates = await getFeedAvailableDates({ country, city });

  return <HeaderCalendarClient availableDates={availableDates} />;
}
