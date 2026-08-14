import React, { useEffect, useLayoutEffect, useRef, useMemo, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useUpdateCase } from "../hooks/useCases";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { useCaseStore } from "../store/caseStore";
import { getAllowedTransitions } from "../utils/permissions";
import type { CaseItem, CaseStatus, CaseFormValues } from "../types";
import { mapCaseToVoucherBuffer } from "../hooks/useMapCaseToVoucherBuffer";
import { 
  CheckCircle2, 
  Ban, 
  RotateCcw, 
  PlayCircle, 
  LoaderCircle, 
  CheckCheck,
  FileCheck,
  RefreshCw,
  AlertCircle,
  X,
  Clock3,
} from "lucide-react";
import { VoucherBuffer } from "../types";
import { ExtendDeadlinePopup } from "./ExtendDeadlinePopup";

interface StatusActionPopupProps {
  caseItem: CaseItem;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onStatusUpdate?: (newStatus: string) => void;
}

const STATUS_CONFIG: Record<CaseStatus, { label: string; icon: React.ReactNode; color: string }> = {
  Prepared: { label: "Prepare", icon: <FileCheck className="h-4 w-4" />, color: "text-blue-500" },
  Reviewed: { label: "Review", icon: <RefreshCw className="h-4 w-4" />, color: "text-purple-500" },
  Returned: { label: "Return", icon: <RotateCcw className="h-4 w-4" />, color: "text-orange-500" },
  Rejected: { label: "Reject", icon: <Ban className="h-4 w-4" />, color: "text-red-500" },
  Approved: { label: "Approve", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  OnProgress: { label: "On Progress", icon: <PlayCircle className="h-4 w-4" />, color: "text-blue-500" },
  Solved: { label: "Solved", icon: <CheckCheck className="h-4 w-4" />, color: "text-green-600" },
  "Not Solved": { label: "Not Solved", icon: <AlertCircle className="h-4 w-4" />, color: "text-red-500" },
  Accepted: { label: "Accept", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  Fixed: { label: "Fixed", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-blue-500" },
  "Urgent": { label: "Urgent", icon: <AlertCircle className="h-4 w-4" />, color: "#ee6b6e" },
};

export function StatusActionPopup({ 
  caseItem, 
  onClose, 
  anchorEl,
  onStatusUpdate,
}: StatusActionPopupProps) {
  const { mutate: updateCase, isPending } = useUpdateCase();
  const popupRef = useRef<HTMLDivElement>(null);
  const userRole = useAuthStore.getState().getUserRole();
  const userId = useAuthStore((s) => s.userId);
  const personId = useAuthStore((s) => s.personId);
  const userDepartment = useAuthStore((s) => s.userDepartment);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  
  // Flag to prevent closing during status update
  const isUpdatingRef = useRef(false);

  const allowedStatuses = useMemo(() => {
    if (!userRole) return [];
    return getAllowedTransitions(caseItem.status, caseItem.functionalConsultantId, userRole);
  }, [caseItem.status, userRole]);

  const canExtendDeadline = useMemo(() => {
    return (
      userRole !== UserRole.DEVELOPER &&
      !["Prepared", "Edited", "Returned", "Reviewed", "Rejected", "Not Solved"].includes(caseItem.status)
    );
  }, [caseItem.status, userRole]);

  const [showExtendPopup, setShowExtendPopup] = useState(false);

  const handleRequestExtendDeadline = () => {
    setShowExtendPopup(true);
  };

  // Memoized close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleStatusChange = (targetStatus: CaseStatus) => {
    if (!userRole) {
      console.error("No user role available for status transition");
      return;
    }

    const allowed = getAllowedTransitions(caseItem.status, caseItem.functionalConsultantId, userRole);
    if (!allowed.includes(targetStatus)) {
      console.error(`Transition to ${targetStatus} not allowed for role ${userRole}`);
      return;
    }

    let transitionReason: string | null = null;
    if (targetStatus === "Returned" || targetStatus === "Rejected") {
      transitionReason = window.prompt(`Enter the reason for ${targetStatus.toLowerCase()}ing this case:`);
      if (transitionReason === null || !transitionReason.trim()) {
        setTransitionError(`A reason is required before ${targetStatus.toLowerCase()}ing this case.`);
        return;
      }
      setTransitionError(null);
    }

    if (userRole === UserRole.ADMIN && (targetStatus === "Accepted") && (caseItem.status === "Reviewed" || caseItem.status === "Urgent")) {
      useCaseStore.getState().setTransitionTargetStatus("Accepted");
      useCaseStore.getState().openEditModal(caseItem);
      handleClose();
      return;
    }

    if ((userRole === UserRole.ADMIN || userRole === UserRole.DEVELOPER) && (targetStatus === "Fixed" || targetStatus === "Solved" || targetStatus === "Not Solved")) {
      useCaseStore.getState().setTransitionTargetStatus(targetStatus);
      useCaseStore.getState().openEditModal(caseItem);
      handleClose();
      return;
    }

    // Set updating flag
    isUpdatingRef.current = true;

    // Construct form values from existing case data
    const formValues: CaseFormValues = {
      projectName: caseItem.projectName || "",
      projectNameId: String(caseItem.projectNameId || ""),
      functionalConsultantId: caseItem.functionalConsultantId,
      fcDepartmentId: caseItem.fcDepartmentId,
      module: caseItem.module || "",
      caseType: caseItem.caseType || "Error",
      developer:
        caseItem.developerId != null
          ? String(caseItem.developerId)
          : "",
      paidorNot: caseItem.paidorNot || "Free",
      department: caseItem.department || "",
      issueDate: caseItem.issueDate ? caseItem.issueDate.split('T')[0] : "",
      deadLine: caseItem.deadLine ? caseItem.deadLine.split('T')[0] : "",
      releaseNote: caseItem.releaseNote || "",
      issues: caseItem.issues || "",
      developmentStatus: caseItem.developmentStatus || "Prepared",
      status: targetStatus,
    };

    const payload = mapCaseToVoucherBuffer(formValues, userId, personId, userDepartment, caseItem);

    const normalizedPayload = {
      ...payload,
      voucher: {
        ...payload.voucher,
        consignee3: Number(payload.voucher.consignee3) || null,
      },
      activity: {
        ...payload.activity,
        remark: transitionReason || "",
      }
    } as VoucherBuffer;

    updateCase(normalizedPayload, {
      onSuccess: () => {
        onStatusUpdate?.(targetStatus);
        handleClose();
      },
      onError: (err) => {
        console.error("UPDATE ERROR", err);
      },
    });
  };

  // Click outside to close - with delay to prevent immediate close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside the popup
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        console.log('🖱️ Clicked outside');
        handleClose();
      }
    };

    // Add small delay to prevent click events from triggering close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('⌨️ Escape key pressed');
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  // REMOVED: The overflow:hidden effect that was causing the grid to resize
  // This was the culprit - removing it fixes the grid size issue

  const [position, setPosition] = useState({ top: 0, left: 0, anchor: "bottom" as "top" | "bottom" });

  const getPopupPosition = (): { top: number; left: number; anchor: "top" | "bottom" } => {
    if (!anchorEl) return { top: 0, left: 0, anchor: "bottom" };
    const rect = anchorEl.getBoundingClientRect();
    const popupWidth = 260;
    const popupHeight = 260;
    const left = Math.min(rect.left, window.innerWidth - popupWidth - 10);
    const spaceBelow = window.innerHeight - rect.bottom;
    const anchor: "top" | "bottom" = spaceBelow >= popupHeight ? "bottom" : "top";

    return {
      top: anchor === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left,
      anchor,
    };
  };

  useLayoutEffect(() => {
    if (!anchorEl) return;
    setPosition(getPopupPosition());
  }, [anchorEl, allowedStatuses.length, canExtendDeadline]);

  if (allowedStatuses.length === 0 && !canExtendDeadline) {
    return null;
  }

  return createPortal(
    <>
      <div
        ref={popupRef}
        className="fixed z-[9999] min-w-[200px] max-w-[260px] rounded-xl border bg-white shadow-2xl overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          transform: position.anchor === 'top' ? 'translateY(-100%)' : 'none',
          pointerEvents: 'auto', // Ensure clicks are captured
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling
      >
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div>
          <p className="font-medium text-sm">{caseItem.caseNumber}</p>
          <p className="text-xs text-muted-foreground">Current: {caseItem.status}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {transitionError && (
        <div className="mx-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{transitionError}</p>
        </div>
      )}

      <div className="p-2 max-h-[300px] overflow-y-auto space-y-0.5">
        {canExtendDeadline && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRequestExtendDeadline();
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
            disabled={isPending}
          >
            <span className="text-violet-500">
              <Clock3 className="h-4 w-4" />
            </span>
            <span className="flex-1 text-left font-medium">Extend Deadline</span>
          </button>
        )}

        {allowedStatuses.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from bubbling
                handleStatusChange(status);
              }}
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

      <div className="px-4 py-2 border-t bg-slate-50/50 flex justify-between">
        <p className="text-xs text-muted-foreground">
          Status: <span className="font-medium">{caseItem.status}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Role: <span className="font-medium">{userRole}</span>
        </p>
      </div>
    </div>

    {showExtendPopup && (
      <ExtendDeadlinePopup
        caseItem={caseItem}
        anchorEl={anchorEl}
        onClose={() => setShowExtendPopup(false)}
        onExtended={() => {
          setShowExtendPopup(false);
          onClose();
        }}
      />
    )}
    </>,
    document.body
  );
}