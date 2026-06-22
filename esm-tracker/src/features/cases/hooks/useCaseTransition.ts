import { useMutation, useQueryClient } from "@tanstack/react-query";

import { casesApi } from "../api/casesApi";

import { CASES_KEY } from "./useCases";

import type { CaseStatus } from "../types";



const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {

  Open: ["InProgress", "Closed"],

  InProgress: ["PendingApproval", "Open"],

  PendingApproval: ["Resolved", "InProgress", "Rejected"],

  Resolved: ["Closed"],

  Closed: [],

  Rejected: ["Open"],

};



export function useCaseTransition() {

  const qc = useQueryClient();



  const { mutate, isPending } = useMutation({

    mutationFn: casesApi.transition,

    onSuccess: (data) => {

      qc.invalidateQueries({ queryKey: [CASES_KEY] });

      qc.setQueryData([CASES_KEY, data.id], data);

    },

  });



  return { mutate, isPending, getAllowedTransitions };

}



export function getAllowedTransitions(current: CaseStatus): CaseStatus[] {

  return VALID_TRANSITIONS[current] ?? [];

}