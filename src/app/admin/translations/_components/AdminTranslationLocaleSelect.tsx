'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SupportedLocale } from '@/lib/admin-api';

interface AdminTranslationLocaleSelectProps {
  readonly id: string;
  readonly value: string;
  readonly locales: readonly SupportedLocale[];
  readonly isDisabled: boolean;
  readonly onChange: (locale: string) => void;
}

function formatLocaleOptionLabel(iso: string, nativeName: string, isActive: boolean): string {
  const inactiveSuffix = isActive ? '' : ' (inactive)';
  return `${nativeName} (${iso})${inactiveSuffix}`;
}

export default function AdminTranslationLocaleSelect(props: AdminTranslationLocaleSelectProps) {
  const { id, value, locales, isDisabled, onChange } = props;
  const labelId = `${id}-label`;

  return (
    <Select
      value={value}
      disabled={isDisabled}
      onValueChange={onChange}
    >
      <SelectTrigger
        id={id}
        aria-labelledby={labelId}
        className="h-10"
      >
        <SelectValue placeholder="Select locale" />
      </SelectTrigger>
      <SelectContent className="z-[110]">
        {locales.map((locale) => (
          <SelectItem
            key={locale.iso}
            value={locale.iso}
          >
            {formatLocaleOptionLabel(locale.iso, locale.nativeName, locale.isActive)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
