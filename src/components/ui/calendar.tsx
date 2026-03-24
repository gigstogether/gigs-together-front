'use client';

import { useEffect, useRef } from 'react';
import type { ComponentProps, HTMLAttributes, Ref, SVGProps, TdHTMLAttributes } from 'react';
import type { DateLibOptions, DayButtonProps } from 'react-day-picker';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker, getDefaultClassNames, useDayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

export interface CalendarDisabledMonthNavTitle {
  prev?: string;
  next?: string;
}

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  disabledMonthNavTitle?: CalendarDisabledMonthNavTitle;
  buttonVariant?: ComponentProps<typeof Button>['variant'];
};

interface CalendarRootProps extends HTMLAttributes<HTMLDivElement> {
  rootRef?: Ref<HTMLDivElement>;
}

interface CalendarChevronProps extends SVGProps<SVGSVGElement> {
  orientation?: 'left' | 'right' | 'down' | 'up';
}

type CalendarWeekNumberProps = TdHTMLAttributes<HTMLTableCellElement>;

type CalendarMonthCaptionProps = {
  calendarMonth: { date: Date };
  displayIndex: number;
} & HTMLAttributes<HTMLDivElement>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  disabledMonthNavTitle,
  components,
  formatters,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const navButton = cn(
    buttonVariants({ variant: buttonVariant }),
    'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
  );
  const navButtonDisabled = cn(
    buttonVariants({ variant: buttonVariant }),
    'h-[--cell-size] w-[--cell-size] select-none p-0 opacity-50 hover:bg-transparent hover:text-foreground',
  );

  const MonthCaption = ({
    calendarMonth,
    displayIndex: _displayIndex,
    className: captionClassName,
    ...captionProps
  }: CalendarMonthCaptionProps) => {
    const dayPicker = useDayPicker();
    const { goToMonth, nextMonth, previousMonth, labels, dayPickerProps } = dayPicker;

    const dateLibOptions: DateLibOptions = {
      // react-day-picker types locale as Partial<DayPickerLocale> internally,
      // but DateLibOptions requires DayPickerLocale — known library type mismatch
      locale: dayPickerProps.locale as DateLibOptions['locale'],
      timeZone: dayPickerProps.timeZone,
      numerals: dayPickerProps.numerals,
    };

    const caption = dayPicker.formatters.formatCaption(calendarMonth.date, dateLibOptions);

    return (
      <div
        className={cn(
          'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
          defaultClassNames.month_caption,
          captionClassName,
        )}
        {...captionProps}
      >
        <div className="select-none text-sm font-medium" aria-live="polite" role="presentation">
          {caption}
        </div>
        <div className="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
          {!previousMonth && disabledMonthNavTitle?.prev ? (
            <span
              title={disabledMonthNavTitle.prev}
              className={cn(navButtonDisabled, 'inline-flex')}
            >
              <ChevronLeftIcon className="size-4" aria-hidden />
            </span>
          ) : (
            <button
              name="previous-month"
              aria-label={labels.labelPrevious(previousMonth)}
              className={navButton}
              type="button"
              disabled={!previousMonth}
              onClick={() => {
                if (previousMonth) {
                  goToMonth(previousMonth);
                }
              }}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          )}
          {!nextMonth && disabledMonthNavTitle?.next ? (
            <span
              title={disabledMonthNavTitle.next}
              className={cn(navButtonDisabled, 'inline-flex')}
            >
              <ChevronRightIcon className="size-4" aria-hidden />
            </span>
          ) : (
            <button
              name="next-month"
              aria-label={labels.labelNext(nextMonth, dateLibOptions)}
              className={navButton}
              type="button"
              disabled={!nextMonth}
              onClick={() => {
                if (nextMonth) {
                  goToMonth(nextMonth);
                }
              }}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      hideNavigation
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        month_caption: cn(
          'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'border-input shadow-xs has-focus:border-ring has-focus:ring-ring/50 relative rounded-md border has-focus:ring-[3px]',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('bg-popover absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : '[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-[--cell-size] select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          'text-muted-foreground select-none text-[0.8rem]',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day,
        ),
        range_start: cn('bg-accent rounded-l-md', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: CalendarRoot,
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        MonthCaption,
        WeekNumber: CalendarWeekNumber,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarRoot({ className, rootRef, ...props }: CalendarRootProps) {
  return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
}

function CalendarChevron({ className, orientation, ...props }: CalendarChevronProps) {
  if (orientation === 'left') {
    return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
  }

  if (orientation === 'right') {
    return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
  }

  return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
}

function CalendarWeekNumber({ children, ...props }: CalendarWeekNumberProps) {
  return (
    <td {...props}>
      <div className="flex size-[--cell-size] items-center justify-center text-center">
        {children}
      </div>
    </td>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
