import { Badge } from "@/shared/components/ui/badge";
import type { CaseStatus } from "../types";
import { cn } from "@/shared/lib/utils";

const STATUS_CONFIG: Record<CaseStatus,{ label: string; className: string }> = {
  Accepted: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200",
  },

  Solved: {
    label: "Solved",
    className:
      "bg-green-100 text-green-800 border-green-200",
  },

  Fixed: {
    label: "Fixed",
    className:
      "bg-teal-100 text-teal-800 border-teal-200",
  },

  Prepared: {
    label: "Prepared",
    className:
      "bg-blue-100 text-blue-800 border-blue-200",
  },

  Edited: {
    label: "Edited",
    className:
      "bg-indigo-100 text-indigo-800 border-indigo-200",
  },

  Rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 border-red-200",
  },

  Returned: {
    label: "Returned",
    className:
      "bg-orange-100 text-orange-800 border-orange-200",
  },

  Reviewed: {
    label: "Reviewed",
    className:
      "bg-cyan-100 text-cyan-800 border-cyan-200",
  },

  "Not Solved": {
    label: "Not Solved",
    className:
      "bg-rose-100 text-rose-800 border-rose-200",
  },

  "On Progress": {
    label: "On Progress",
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200",
  },

  "Urgent": {
    label: "Urgent",
    className:
      "bg-red-100 text-red-800 border-red-200",
  },
};



interface Props {
  status: CaseStatus;
  className?: string;
}

export function StatusBadge({
  status,
  className,
}: Props) {
  const config =
    STATUS_CONFIG[status] ?? {
      label: status,
      className:
        "bg-gray-100 text-gray-700 border-gray-200",
    };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}