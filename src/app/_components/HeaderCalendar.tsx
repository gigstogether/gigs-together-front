'use client';

import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';
import { Calendar } from '@/components/ui/calendar';
import { useCalendarAvailableDates } from './useCalendarAvailableDates';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, toLocalYMD } from '@/lib/utils';
import { FaRegCalendar } from 'react-icons/fa';
import type { Modifiers } from 'react-day-picker';

interface HeaderCalendarProps {
  country: string;
  city: string;
  visibleEventDate?: string;
  visibleEventDateRange?: VisibleEventDateRange;
  onDayClick?: (day: Date, modifiers?: Modifiers, e?: MouseEvent) => void;
}

interface ParsedYearMonth {
  readonly year: number;
  readonly monthIndex: number;
}

const DASH = '-';

const parseYearMonth = (dateString?: string): ParsedYearMonth | undefined => {
  if (!dateString) return undefined;

  // Parse manually to avoid timezone shifts with new Date("YYYY-MM-DD")
  const [year, month] = dateString.split('-').map(Number);
  if (!year || !month) return undefined;

  return {
    year,
    monthIndex: month - 1,
  };
};

const getMonthName = (value: ParsedYearMonth): string => {
  return new Date(value.year, value.monthIndex, 1).toLocaleString('en-GB', { month: 'long' });
};

const formatMonthYear = (value: ParsedYearMonth): string => {
  return `${getMonthName(value)} ${value.year}`;
};

const formatDisplayMonth = (
  dateString?: string,
  visibleEventDateRange?: VisibleEventDateRange,
): string => {
  const start = parseYearMonth(visibleEventDateRange?.startDate ?? dateString);
  const end = parseYearMonth(visibleEventDateRange?.endDate ?? dateString);

  if (!start || !end) return DASH;
  if (start.year === end.year && start.monthIndex === end.monthIndex) {
    return formatMonthYear(start);
  }
  if (start.year === end.year) {
    return `${getMonthName(start)} ${DASH} ${getMonthName(end)} ${start.year}`;
  }

  return `${formatMonthYear(start)} ${DASH} ${formatMonthYear(end)}`;
};

export default function HeaderCalendar(props: HeaderCalendarProps) {
  const { country, city, visibleEventDate, visibleEventDateRange, onDayClick } = props;

  const {
    availableDates,
    isLoading: calendarDatesIsLoading,
    isError: calendarDatesIsError,
    error: calendarDatesQueryError,
  } = useCalendarAvailableDates({
    country,
    city,
  });

  const calendarDatesError = calendarDatesIsError
    ? (calendarDatesQueryError?.message ?? 'Failed to load calendar dates.')
    : undefined;

  const availableSet = new Set(availableDates ?? []);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  const monthFromVisibleDate = useMemo(() => {
    const targetDate = visibleEventDateRange?.startDate ?? visibleEventDate;
    if (!targetDate) return undefined;
    const [year, monthValue] = targetDate.split('-').map(Number);
    if (!year || !monthValue) return undefined;
    return new Date(year, monthValue - 1, 1);
  }, [visibleEventDate, visibleEventDateRange]);

  const { startMonth, endMonth } = useMemo(() => {
    const dates = availableDates ?? [];
    if (dates.length === 0) return { startMonth: undefined, endMonth: undefined };

    const sorted = [...dates].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return { startMonth: undefined, endMonth: undefined };

    const [startYear, startMonthValue] = first.split('-').map(Number);
    const [endYear, endMonthValue] = last.split('-').map(Number);
    if (!startYear || !startMonthValue || !endYear || !endMonthValue) {
      return { startMonth: undefined, endMonth: undefined };
    }

    return {
      startMonth: new Date(startYear, startMonthValue - 1, 1),
      endMonth: new Date(endYear, endMonthValue - 1, 1),
    };
  }, [availableDates]);

  const handleDayClick = (day: Date, modifiers?: Modifiers, e?: MouseEvent) => {
    if (modifiers?.disabled) return;
    onDayClick?.(day, modifiers, e);
  };

  const disabledMatcher = (date: Date) => {
    if (calendarDatesIsLoading || calendarDatesIsError) return true;
    return !availableSet.has(toLocalYMD(date));
  };

  return (
    <form className={cn('sticky top-0 flex w-fit items-center space-x-4 rounded-md')}>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) setMonth(monthFromVisibleDate ?? new Date());
        }}
      >
        <PopoverTrigger
          type="button"
          className="flex items-center gap-2 focus:outline-none"
        >
          <span className="inline-flex items-center justify-center gap-2 px-2 text-base font-normal text-gray-800">
            <FaRegCalendar className="text-gray-600" />
            {formatDisplayMonth(visibleEventDate, visibleEventDateRange)}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="center"
        >
          {calendarDatesIsLoading ? (
            <div className="px-3 py-2 text-sm text-gray-600">Loading calendar…</div>
          ) : null}
          {calendarDatesIsError ? (
            <div className="px-3 py-2 text-sm text-red-600">
              Failed to load calendar dates{calendarDatesError ? `: ${calendarDatesError}` : '.'}
            </div>
          ) : null}
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            disabled={disabledMatcher}
            onDayClick={handleDayClick}
            startMonth={startMonth}
            endMonth={endMonth}
            disabledMonthNavTitle={
              startMonth != null && endMonth != null
                ? { prev: 'No events before this month', next: 'No events after this month' }
                : undefined
            }
          />
        </PopoverContent>
      </Popover>
    </form>
  );
}
