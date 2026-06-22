import { useMemo } from "react";

import { Button } from "@/shared/components/ui/button";

import { getAllowedTransitions, useCaseTransition } from "../hooks/useCaseTransition";

import type { CaseItem, CaseStatus } from "../types";

import { Loader2 } from "lucide-react";



const TRANSITION_LABELS: Record<CaseStatus, string> = {

  Open: "Open",

  InProgress: "Start Progress",

  PendingApproval: "Submit for Approval",

  Resolved: "Mark Resolved",

  Closed: "Close",

  Rejected: "Reject",

};



const TRANSITION_VARIANTS: Record<

  CaseStatus,

  "primary" | "outline" | "danger" | "secondary"

> = {

  Open: "outline",

  InProgress: "primary",

  PendingApproval: "secondary",

  Resolved: "primary",

  Closed: "outline",

  Rejected: "danger",

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

            mutate({ caseId: caseItem.id, targetStatus: target })

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