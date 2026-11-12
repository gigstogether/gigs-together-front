import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminLocationDeleteDialogProps {
  entityLabel: string;
  name: string;
  error: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}

export default function AdminLocationDeleteDialog(props: AdminLocationDeleteDialogProps) {
  const { entityLabel, name, error, isDeleting, onCancel, onDelete } = props;

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            This removes the {entityLabel} from the catalog. Records that are still referenced
            cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void onDelete()}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
