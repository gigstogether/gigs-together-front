'use client';

import { Pencil } from 'lucide-react';

import type { SetAdminTranslationActiveMutationParams } from '@/app/admin/translations/_hooks/use-admin-translations-mutations';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { AdminTranslationRecord, SupportedLocale } from '@/app/admin/_lib/admin-api';
import { cn } from '@/lib/utils';

interface AdminTranslationsTableProps {
  readonly records: readonly AdminTranslationRecord[];
  readonly locales: readonly SupportedLocale[];
  readonly showNamespaceColumn: boolean;
  readonly isSaving: boolean;
  readonly onEdit: (record: AdminTranslationRecord) => void;
  readonly onSetActive: (params: SetAdminTranslationActiveMutationParams) => void;
}

function buildLocaleLabel(iso: string, locales: readonly SupportedLocale[]): string {
  const locale = locales.find((item) => item.iso === iso);
  if (!locale) {
    return iso;
  }

  return `${locale.nativeName} (${locale.iso})`;
}

const shrinkableCellClassName = 'max-w-0 truncate px-2 py-2 align-top';
const kindColClassName = 'w-[5.5rem]';
const kindCellClassName = 'whitespace-nowrap px-2 py-2 align-middle text-muted-foreground';
const trailingActiveCellClassName = 'whitespace-nowrap py-2 pl-4 pr-0 align-middle';
const trailingActionsCellClassName = 'whitespace-nowrap py-2 pl-2 pr-2 align-middle';
const actionsColClassName = 'w-12';

export default function AdminTranslationsTable(props: AdminTranslationsTableProps) {
  const { records, locales, showNamespaceColumn, isSaving, onEdit, onSetActive } = props;

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          {showNamespaceColumn ? <col className="w-[10%]" /> : null}
          <col className="w-[9rem]" />
          <col className="w-[6rem]" />
          <col />
          <col className={kindColClassName} />
          <col className="w-14" />
          <col className={actionsColClassName} />
        </colgroup>
        <thead className="sticky top-0 z-[1] border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            {showNamespaceColumn ? <th className="px-2 py-2 font-medium">Namespace</th> : null}
            <th className="px-2 py-2 font-medium">Key</th>
            <th className="px-2 py-2 font-medium">Locale</th>
            <th className="px-2 py-2 font-medium">Value</th>
            <th className={cn(kindCellClassName, 'font-medium text-foreground')}>Kind</th>
            <th className={cn(trailingActiveCellClassName, 'font-medium')}>
              <span className="sr-only">Active</span>
            </th>
            <th className={cn(trailingActionsCellClassName, 'font-medium')}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => {
            const localeLabel = buildLocaleLabel(record.locale, locales);

            return (
              <tr
                key={record.id}
                className="hover:bg-muted/30"
              >
                {showNamespaceColumn ? (
                  <td
                    className={cn(shrinkableCellClassName, 'text-foreground')}
                    title={record.namespace}
                  >
                    <span className="inline-block max-w-full truncate rounded-md border border-border/70 px-1.5 py-0.5 text-xs">
                      {record.namespace}
                    </span>
                  </td>
                ) : null}
                <td
                  className={cn(shrinkableCellClassName, 'font-mono text-foreground')}
                  title={record.key}
                >
                  {record.key}
                </td>
                <td
                  className={cn(shrinkableCellClassName, 'text-muted-foreground')}
                  title={localeLabel}
                >
                  {localeLabel}
                </td>
                <td
                  className={cn(shrinkableCellClassName, 'text-foreground')}
                  title={record.value}
                >
                  {record.value}
                </td>
                <td className={kindCellClassName}>
                  <span className="inline-flex items-center rounded-md border border-border/70 px-1.5 py-0.5 text-xs">
                    {record.kind}
                  </span>
                </td>
                <td className={trailingActiveCellClassName}>
                  <div className="flex justify-end pr-3">
                    <Switch
                      checked={record.isActive}
                      disabled={isSaving}
                      aria-label={`Active for ${record.key}`}
                      onCheckedChange={(checked) =>
                        onSetActive({
                          id: record.id,
                          isActive: checked,
                        })
                      }
                    />
                  </div>
                </td>
                <td className={trailingActionsCellClassName}>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={isSaving}
                      aria-label={`Edit translation ${record.key}`}
                      onClick={() => onEdit(record)}
                    >
                      <Pencil
                        className="size-3.5"
                        aria-hidden
                      />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
