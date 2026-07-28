import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  /** if provided, dialog will auto-close after this many milliseconds */
  autoCloseMs?: number;
  /** hide the OK button */
  hideOk?: boolean;
}

export function StatusDialog({
  open,
  onClose,
  title = "Success",
  message,
  autoCloseMs,
  hideOk,
}: StatusDialogProps) {
  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;

    const t = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  const showOk = !hideOk && (!autoCloseMs || autoCloseMs <= 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
        <DialogHeader className="items-center text-center">
            <div className="relative flex justify-center mb-6">
                <span className="absolute h-24 w-24 rounded-full bg-green-500/15 animate-ping" />

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-xl animate-zoom-in">
                    <CheckCircle2 className="h-10 w-10 text-white animate-zoom-in" />
                </div>
            </div>

          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        {showOk && (
          <Button
            className="mt-6 w-full"
            onClick={onClose}
          >
            OK
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}