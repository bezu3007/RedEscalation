import { Badge } from "@/shared/components/ui/badge";
import type { CaseType } from "../types";
import { cn } from "@/shared/lib/utils";

const TYPE_CONFIG: Record<CaseType, { label: string; className: string }> = {
  Performance: {
    label: "Performance",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  Error: {
    label: "Error",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Report: {
    label: "Report",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  "Intermitant Case": {
    label: "Intermitant Case",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  "New Functionality": {
    label: "New Functionality",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Customization: {
    label: "Customization",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  "Not Implemented": {
    label: "Not Implemented",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

// Default fallback config for unknown types
const DEFAULT_CONFIG = {
  label: "Unknown",
  className: "bg-gray-50 text-gray-700 border-gray-200",
};

interface Props {
  type: CaseType;
  className?: string;
}

export function CaseTypeBadge({ type, className }: Props) {
  // Get config or fallback to default if type is undefined or not found
  const config = type && TYPE_CONFIG[type] ? TYPE_CONFIG[type] : DEFAULT_CONFIG;

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