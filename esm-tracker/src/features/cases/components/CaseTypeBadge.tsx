import { Badge } from "@/shared/components/ui/badge";
import type { CaseType } from "../types";
import { cn } from "@/shared/lib/utils";

const TYPE_CONFIG: Record<CaseType,{ label: string; className: string }> = {
  Performance: {
    label: "Performance",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  Error: {
    label: "Error",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  Report: {
    label: "Report",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  "Intermitant Case": {
    label: "Intermitant",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  "New Functionality": {
    label: "Feature",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  Customization: {
    label: "Custom",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  "Not Implemented": {
    label: "Not Impl",
    className:
      "bg-gray-50 text-gray-700 border-gray-200",
  },

  Other: {
    label: "Other",
    className:
      "bg-slate-50 text-slate-700 border-slate-200",
  },
};

interface Props {
  type: CaseType;
  className?: string;
}

export function CaseTypeBadge({type,className,}: Props) {
  const config =
    TYPE_CONFIG[type] ??
    TYPE_CONFIG["Other"];

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