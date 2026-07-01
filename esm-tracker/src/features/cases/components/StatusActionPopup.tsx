import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCaseTransition } from "../hooks/useCaseTransition";
import type { CaseItem, CaseStatus } from "../types";
import { 
  CheckCircle2, 
  Ban, 
  RotateCcw, 
  PlayCircle, 
  LoaderCircle, 
  CheckCheck,
  Clock3,
  FileCheck,
  RefreshCw,
  AlertCircle,
  X
} from "lucide-react";

interface StatusActionPopupProps {
  caseItem: CaseItem;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

// Status configuration
const STATUS_CONFIG: Record<CaseStatus, { label: string; icon: React.ReactNode; color: string }> = {
  Prepared: { label: "Prepare", icon: <FileCheck className="h-4 w-4" />, color: "text-blue-500" },
  Review: { label: "Review", icon: <RefreshCw className="h-4 w-4" />, color: "text-purple-500" },
  Returned: { label: "Return", icon: <RotateCcw className="h-4 w-4" />, color: "text-orange-500" },
  Rejected: { label: "Reject", icon: <Ban className="h-4 w-4" />, color: "text-red-500" },
  Approved: { label: "Approve", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  OnProgress: { label: "On Progress", icon: <PlayCircle className="h-4 w-4" />, color: "text-blue-500" },
  Solved: { label: "Solved", icon: <CheckCheck className="h-4 w-4" />, color: "text-green-600" },
  NotSolved: { label: "Not Solved", icon: <AlertCircle className="h-4 w-4" />, color: "text-red-500" },
  Accepted: { label: "Accept", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  Fixed: { label: "Fix", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-blue-500" },
  "Re Journal": { label: "Re Journal", icon: <RefreshCw className="h-4 w-4" />, color: "text-orange-500" },
  Reviewed: { label: "Review", icon: <FileCheck className="h-4 w-4" />, color: "text-purple-500" },
  "On Progress": { label: "On Progress", icon: <PlayCircle className="h-4 w-4" />, color: "text-blue-500" },
  Closed: { label: "Close", icon: <X className="h-4 w-4" />, color: "text-slate-600" },
  Open: { label: "Open", icon: <RotateCcw className="h-4 w-4" />, color: "text-slate-500" },
  InProgress: { label: "In Progress", icon: <PlayCircle className="h-4 w-4" />, color: "text-blue-500" },
  PendingApproval: { label: "Pending Approval", icon: <LoaderCircle className="h-4 w-4" />, color: "text-amber-500" },
  Resolved: { label: "Resolved", icon: <CheckCheck className="h-4 w-4" />, color: "text-green-600" },
  DeadlineExtension: { label: "Deadline Extension", icon: <Clock3 className="h-4 w-4" />, color: "text-violet-600" },
};

// All available statuses (filtered by allowed transitions)
const ALL_STATUSES: CaseStatus[] = [
  "Prepared", "Review", "Returned", "Rejected", "Approved", 
  "OnProgress", "Solved", "NotSolved", "Open", "InProgress", 
  "PendingApproval", "Resolved", "Closed", "DeadlineExtension"
];

export function StatusActionPopup({ caseItem, onClose, anchorEl }: StatusActionPopupProps) {
  const { mutate, isPending } = useCaseTransition();
  const popupRef = useRef<HTMLDivElement>(null);

  // Get allowed transitions from your hook
  const getAllowedTransitions = (status: CaseStatus): CaseStatus[] => {
    // This should match your existing logic
    const transitions: Record<CaseStatus, CaseStatus[]> = {
      // Define your transition rules here
      Open: ["InProgress", "PendingApproval"],
      InProgress: ["PendingApproval", "OnProgress"],
      PendingApproval: ["Approved", "Rejected", "Returned"],
      Approved: ["InProgress", "Solved", "Closed"],
      Rejected: ["Open", "InProgress"],
      Returned: ["Open", "InProgress"],
      OnProgress: ["Review", "Solved"],
      Review: ["Approved", "Returned", "Rejected"],
      Solved: ["Closed", "NotSolved"],
      NotSolved: ["Open", "InProgress"],
      Closed: [],
      DeadlineExtension: ["Open", "InProgress"],
      Prepared: ["Review", "Returned"],
      "On Progress": ["Review", "Solved"],
      Accepted: ["InProgress", "Solved"],
      Fixed: ["Review", "Solved"],
      "Re Journal": ["Open", "InProgress"],
      Reviewed: ["Approved", "Returned"],
      Resolved: ["Closed"],
    };
    return transitions[status] || [];
  };

  const allowedStatuses = getAllowedTransitions(caseItem.status);

  const handleStatusChange = (targetStatus: CaseStatus) => {
    mutate({
      caseId: String(caseItem.id),
      targetStatus,
    });
    onClose();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  

  // Position the popup near the clicked cell
  const getPopupPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
    };
  };

  if (allowedStatuses.length === 0) return null;

  const position = getPopupPosition();

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[9999] min-w-[200px] max-w-[260px] rounded-xl border bg-white shadow-2xl overflow-hidden"
      style={{
        top: position.top,
        left: Math.min(position.left, window.innerWidth - 260),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <p className="font-medium text-sm">
          Change Status: <span className="font-mono">{caseItem.caseNumber}</span>
        </p>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status Options */}
      <div className="p-2 max-h-[300px] overflow-y-auto space-y-0.5">
        {allowedStatuses.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              disabled={isPending}
            >
              <span className={config?.color || "text-slate-500"}>
                {config?.icon || <RefreshCw className="h-4 w-4" />}
              </span>
              <span className="flex-1 text-left font-medium">
                {config?.label || status}
              </span>
              {isPending && (
                <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Current Status */}
      <div className="px-4 py-2 border-t bg-slate-50/50">
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium">{caseItem.status}</span>
        </p>
      </div>
    </div>,
    document.body
  );
}