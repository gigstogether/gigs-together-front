'use client';

import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import type { VisibleEventDateRange } from '@/app/feed/_components/feed-client/useVisibleEventDateOnScroll';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, toLocalYMD } from '@/lib/utils';
import { FaRegCalendar } from 'react-icons/fa';
import type { Modifiers } from 'react-day-picker';
import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';

export interface HeaderCalendarClientProps {
  readonly availableDates: readonly string[];
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

export default function HeaderCalendarClient(props: HeaderCalendarClientProps) {
  const { availableDates } = props;
  const availableSet = new Set(availableDates);

  const {
    config: { earliestEventDate: visibleEventDate, visibleEventDateRange, onDayClick },
  } = useHeaderConfig();

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
    if (availableDates.length === 0) return { startMonth: undefined, endMonth: undefined };

    const first = availableDates[0];
    const last = availableDates[availableDates.length - 1];
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
