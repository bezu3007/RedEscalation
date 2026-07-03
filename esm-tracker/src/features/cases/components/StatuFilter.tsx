// features/cases/components/StatusFilter.tsx

import React from "react";
import { useCaseStore } from "../store/caseStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { ROLE_VISIBLE_STATUSES } from "../utils/permissions";
import { UserRole } from "@/features/auth/types";
import { CaseStatus } from "../types";

const STATUS_LABELS: Record<CaseStatus, string> = {
  Prepared: "Prepared",
  Reviewed: "Reviewed",
  Returned: "Returned",
  Rejected: "Rejected",
  Accepted: "Accepted",
  OnProgress: "On Progress",
  Solved: "Solved",
  NotSolved: "Not Solved",
  Open: "Open",
  InProgress: "In Progress",
  PendingApproval: "Pending Approval",
  Resolved: "Resolved",
  Closed: "Closed",
  DeadlineExtension: "Deadline Extension",
  Approved: "Approved",
  Fixed: "Fixed",
  "Re Journal": "Re Journal",
  "On Progress": "On Progress",
};

export function StatusFilter() {
  const userRole = useAuthStore.getState().getUserRole();
  const { filters, setFilters } = useCaseStore();
  
  // Get statuses available for this role
  const visibleStatuses = userRole != null ? (ROLE_VISIBLE_STATUSES[userRole] ?? []) : [];
  const availableStatuses = visibleStatuses;

  // Get current selected status or default to first available
  const currentStatus = filters.status || "";

  return (
    <select
      value={currentStatus}
      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      className="px-3 py-2 border rounded-md text-sm bg-white"
    >
      <option value="">All Statuses</option>
      {availableStatuses.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status] || status}
        </option>
      ))}
    </select>
  );
}