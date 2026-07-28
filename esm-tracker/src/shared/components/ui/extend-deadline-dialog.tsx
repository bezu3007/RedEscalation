import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface ExtendDeadlineDialogProps {
  open: boolean;
  onClose: () => void;

  currentDeadline?: string;

  onSubmit: (data: {
    deadline: string;
    reason: string;
  }) => Promise<void> | void;

  loading?: boolean;
}

function normalizeDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return date.toISOString().slice(0, 16);
}

export function ExtendDeadlineDialog({
  open,
  onClose,
  currentDeadline,
  onSubmit,
  loading = false,
}: ExtendDeadlineDialogProps) {
  const [deadline, setDeadline] = useState(normalizeDateTime(currentDeadline));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ deadline?: string; reason?: string }>({});

  useEffect(() => {
    if (open) {
      setDeadline(normalizeDateTime(currentDeadline));
      setReason("");
      setErrors({});
    }
  }, [open, currentDeadline]);

  const canSubmit = useMemo(() => {
    return Boolean(deadline && reason.trim());
  }, [deadline, reason]);

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!deadline) {
      nextErrors.deadline = "Please select a new deadline.";
    }
    if (!reason.trim()) {
      nextErrors.reason = "Please enter a reason for the extension.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      deadline,
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="space-y-1">
          <DialogTitle>Extend Deadline</DialogTitle>
          <DialogDescription>
            Update the deadline and add a short reason for the extension.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-3">
            <label className="text-sm font-medium">New Deadline *</label>
            <Input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="h-12 bg-white"
            />
            {errors.deadline ? (
              <p className="text-sm text-red-600">{errors.deadline}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Reason *</label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe why the deadline needs to be extended..."
              className="min-h-[140px] bg-white"
            />
            {errors.reason ? (
              <p className="text-sm text-red-600">{errors.reason}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mt-6 justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
          >
            {loading ? "Extending..." : "Extend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
