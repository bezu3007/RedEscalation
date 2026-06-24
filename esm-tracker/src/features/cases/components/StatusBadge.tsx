import { Badge } from "@/shared/components/ui/badge";
import type { CaseStatus } from "../types";
import { cn } from "@/shared/lib/utils";

const STATUS_CONFIG: Record<CaseStatus,{ label: string; className: string }> = {

  Open: { label: "Open", className: "bg-blue-100 text-blue-800 border-blue-200" },

  InProgress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },

  PendingApproval: { label: "Pending Approval", className: "bg-purple-100 text-purple-800 border-purple-200" },

  Resolved: { label: "Resolved", className: "bg-green-100 text-green-800 border-green-200" },

  Closed: { label: "Closed", className: "bg-gray-100 text-gray-700 border-gray-200" },

  Rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },

  Approved: {label: "Approved", className: "bg-emerald-100 text-emerald-800 border-emerald-200",},

  Returned: {label: "Returned", className: "bg-orange-100 text-orange-800 border-orange-200",},

  DeadlineExtension: {label: "Deadline Extension", className: "bg-violet-100 text-violet-800 border-violet-200",},
};



interface Props {
  status: CaseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}