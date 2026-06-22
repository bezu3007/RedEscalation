import { Badge } from "@/shared/components/ui/badge";

import type { CaseType } from "../types";

import { cn } from "@/shared/lib/utils";



const TYPE_CONFIG: Record<CaseType, { label: string; className: string }> = {

  Bug: { label: "Bug", className: "bg-red-50 text-red-700 border-red-200" },

  FeatureRequest: { label: "Feature", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },

  Support: { label: "Support", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },

  Payment: { label: "Payment", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },

  Infrastructure: { label: "Infra", className: "bg-orange-50 text-orange-700 border-orange-200" },

  Other: { label: "Other", className: "bg-gray-50 text-gray-700 border-gray-200" },

};



interface Props {

  type: CaseType;

  className?: string;

}



export function CaseTypeBadge({ type, className }: Props) {

  const config = TYPE_CONFIG[type];

  return (

    <Badge

      variant="outline"

      className={cn("text-xs font-medium", config.className, className)}

    >

      {config.label}

    </Badge>

  );

}