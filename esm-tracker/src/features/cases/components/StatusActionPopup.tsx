// StatusActionPopup.tsx

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useUpdateCase } from "../hooks/useCases";
import { useAuthStore } from "@/features/auth/store/authStore";
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
  Clock3,
  FileCheck,
  RefreshCw,
  AlertCircle,
  X
} from "lucide-react";
import { VoucherBuffer } from "../types";

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
  Fixed: { label: "Fix", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-blue-500" },
  "Re Journal": { label: "Re Journal", icon: <RefreshCw className="h-4 w-4" />, color: "text-violet-600" },
};

export function StatusActionPopup({ 
  caseItem, 
  onClose, 
  anchorEl,
  onStatusUpdate 
}: StatusActionPopupProps) {
  const { mutate: updateCase, isPending } = useUpdateCase();
  const popupRef = useRef<HTMLDivElement>(null);
  const userRole = useAuthStore.getState().getUserRole();
  const userId = useAuthStore((s) => s.userId);
  const personId = useAuthStore((s) => s.personId);
  
  // Flag to prevent closing during status update
  const isUpdatingRef = useRef(false);

  const allowedStatuses = useMemo(() => {
    if (!userRole) return [];
    return getAllowedTransitions(caseItem.status, userRole);
  }, [caseItem.status, userRole]);

  // Memoized close handler
  const handleClose = useCallback(() => {
    console.log('🔴 Closing popup');
    // Don't close if updating
    if (isUpdatingRef.current) {
      console.log('⏳ Update in progress, delaying close');
      return;
    }
    onClose();
  }, [onClose]);

  const handleStatusChange = (targetStatus: CaseStatus) => {
    if (!userRole) {
      console.error("No user role available for status transition");
      return;
    }

    const allowed = getAllowedTransitions(caseItem.status, userRole);
    if (!allowed.includes(targetStatus)) {
      console.error(`Transition to ${targetStatus} not allowed for role ${userRole}`);
      return;
    }

    // Set updating flag
    isUpdatingRef.current = true;

    // Construct form values from existing case data
    const formValues: CaseFormValues = {
      projectName: caseItem.projectName || "",
      projectNameId: String(caseItem.projectNameId || ""),
      functionalConsultantId: caseItem.functionalConsultantId,
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

    const payload = mapCaseToVoucherBuffer(formValues, userId, caseItem);

    const normalizedPayload = {
      ...payload,
      voucher: {
        ...payload.voucher,
        consignee3: Number(payload.voucher.consignee3) || null,
      },
    } as VoucherBuffer;

    console.log("Status Update Payload:", normalizedPayload);

    updateCase(
      {
        id: caseItem.id!,
        body: normalizedPayload,
      },
      {
        onSuccess: () => {
          console.log(`✅ Status updated to: ${targetStatus}`);
          isUpdatingRef.current = false;
          if (onStatusUpdate) {
            onStatusUpdate(targetStatus);
          }
          // Close after successful update
          handleClose();
        },
        onError: (err) => {
          console.error("❌ Status update error:", err);
          isUpdatingRef.current = false;
          // Don't close on error - let user retry
        },
      }
    );
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

  const getPopupPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    const popupWidth = 260;
    const left = Math.min(rect.left, window.innerWidth - popupWidth - 10);
    return {
      top: rect.bottom + 4,
      left: left,
    };
  };

  if (allowedStatuses.length === 0) {
    return null;
  }

  const position = getPopupPosition();

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[9999] min-w-[200px] max-w-[260px] rounded-xl border bg-white shadow-2xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
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
            console.log('❌ Close button clicked');
            handleClose();
          }}
          className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-2 max-h-[300px] overflow-y-auto space-y-0.5">
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
    </div>,
    document.body
  );
}