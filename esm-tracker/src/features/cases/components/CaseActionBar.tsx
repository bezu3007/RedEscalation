import { useMemo } from "react";

import { Button } from "@/shared/components/ui/button";

import { getAllowedTransitions, useCaseTransition } from "../hooks/useCaseTransition";

import type { CaseItem, CaseStatus } from "../types";

import { Loader2 } from "lucide-react";

const TRANSITION_LABELS: Record<CaseStatus, string> = {
  Accepted: "Accept",
  Solved: "Mark Solved",
  Fixed: "Mark Fixed",
  Prepared: "Prepare",
  "Re Journal": "Re Journal",
  Rejected: "Reject",
  Returned: "Return",
  Reviewed: "Review",
  "Not Solved": "Mark Not Solved",
  "On Progress": "Start Progress",
};


const TRANSITION_VARIANTS: Record<
  CaseStatus,
  "primary" | "outline" | "danger" | "secondary"
> = {
  Accepted: "secondary",
  Solved: "primary",
  Fixed: "primary",
  Prepared: "secondary",
  "Re Journal": "outline",
  Rejected: "danger",
  Returned: "outline",
  Reviewed: "secondary",
  "Not Solved": "danger",
  "On Progress": "primary",
};



interface Props {

  caseItem: CaseItem;

}



export function CaseActionBar({ caseItem }: Props) {

  const { mutate, isPending } = useCaseTransition();



  const allowed = useMemo(

    () => getAllowedTransitions(caseItem.status),

    [caseItem.status]

  );



  if (allowed.length === 0) return null;



  return (

    <div className="flex flex-wrap gap-2">

      {allowed.map((target) => (

        <Button

          key={target}

          variant={TRANSITION_VARIANTS[target]}

          size="sm"

          disabled={isPending}

          onClick={() =>

            mutate({ caseId: String(caseItem.id), targetStatus: target })

          }

        >

          {isPending && (

            <Loader2 className="mr-2 h-3 w-3 animate-spin" />

          )}

          {TRANSITION_LABELS[target]}

        </Button>

      ))}

    </div>

  );

}