import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUpdateCase } from "../hooks/useCases";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { LoaderCircle, X } from "lucide-react";
import { mapCaseToVoucherBuffer } from "../hooks/useMapCaseToVoucherBuffer";
import type { CaseItem, CaseFormValues } from "../types";

interface ExtendDeadlinePopupProps {
  caseItem: CaseItem;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onExtended?: () => void;
}

function formatDateOnly(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toISOString().slice(0, 10);
}

function compareDateOnly(value: string, current?: string) {
  if (!current) return true;
  const currentDate = new Date(current);
  if (Number.isNaN(currentDate.valueOf())) return true;
  const currentClean = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const nextDate = new Date(value);
  return nextDate > currentClean;
}

export function ExtendDeadlinePopup({
  caseItem,
  anchorEl,
  onClose,
  onExtended,
}: ExtendDeadlinePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [deadline, setDeadline] = useState(formatDateOnly(caseItem.deadLine));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ deadline?: string; reason?: string }>({});
  const { mutate: updateCase, isPending } = useUpdateCase();
  const userId = useAuthStore((state) => state.userId);
  const personId = useAuthStore((state) => state.personId);

  useEffect(() => {
    setDeadline(formatDateOnly(caseItem.deadLine));
    setReason("");
    setErrors({});
  }, [caseItem.deadLine]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 50);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const canSubmit = useMemo(() => {
    return Boolean(deadline && reason.trim());
  }, [deadline, reason]);

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!deadline) {
      nextErrors.deadline = "Please select a new deadline.";
    } else if (!compareDateOnly(deadline, caseItem.deadLine)) {
      nextErrors.deadline = "The new deadline must be after the current deadline.";
    }
    if (!reason.trim()) {
      nextErrors.reason = "Please enter a reason for the extension.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const formValues: CaseFormValues = {
      projectName: caseItem.projectName || "",
      projectNameId: String(caseItem.projectNameId || ""),
      functionalConsultantId: caseItem.functionalConsultantId,
      module: caseItem.module || "",
      caseType: caseItem.caseType || "Error",
      developer: caseItem.developerId != null ? String(caseItem.developerId) : "",
      paidorNot: caseItem.paidorNot || "Free",
      department: caseItem.department || "",
      issueDate: caseItem.issueDate ? caseItem.issueDate.split("T")[0] : "",
      deadLine: deadline,
      releaseNote: caseItem.releaseNote || "",
      issues: caseItem.issues || "",
      developmentStatus: caseItem.developmentStatus || "Prepared",
      status: caseItem.status,
    };

    const payload = mapCaseToVoucherBuffer(formValues, userId, personId, caseItem);
    const normalizedPayload = {
      ...payload,
      voucher: {
        ...payload.voucher,
        endDate: deadline,
        remark: reason.trim(),
      },
      activity: {
        ...payload.activity,
        remark: reason.trim(),
      },
    };

    updateCase(normalizedPayload, {
      onSuccess: () => {
        onExtended?.();
        onClose();
      },
      onError: (error) => {
        console.error("Extend deadline failed", error);
      },
    });
  };

    const getPopupPosition = () => {
    const popupWidth = 360;
    const popupHeight = 300; // adjust to your popup height

    return {
        top: (window.innerHeight - popupHeight) / 2,
        left: (window.innerWidth - popupWidth) / 2,
    };
    };

  const position = getPopupPosition();

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[9999] min-w-[280px] max-w-[360px] rounded-2xl border bg-white shadow-2xl"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-slate-50">
        <div>
          <p className="font-semibold">Extend Deadline</p>
          <p className="text-xs text-muted-foreground">Current deadline: {caseItem.deadLine ? new Date(caseItem.deadLine).toLocaleDateString() : "—"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">New Deadline *</label>
          <Input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="h-12 bg-white"
          />
          {errors.deadline ? <p className="text-sm text-red-600">{errors.deadline}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason *</label>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describe why the deadline needs to be extended..."
            className="min-h-[120px] bg-white"
          />
          {errors.reason ? <p className="text-sm text-red-600">{errors.reason}</p> : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Extending
              </span>
            ) : (
              "Extend"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
