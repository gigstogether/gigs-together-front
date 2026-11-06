import 'server-only';

import HeaderCalendarClient from '@/app/feed/_components/HeaderCalendarClient';
import { getAvailableGigDates } from '@/app/feed/_lib/feed.server';

export interface HeaderCalendarProps {
  country: string;
  communitySlug: string;
}

export default async function HeaderCalendar(props: HeaderCalendarProps) {
  const { country, communitySlug } = props;

  const availableDates = await getAvailableGigDates({ country, communitySlug });

  return <HeaderCalendarClient availableDates={availableDates} />;
}
