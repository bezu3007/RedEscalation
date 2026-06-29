import { useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import { CASES_KEY } from "./useCases";
import type { CaseStatus } from "../types";

const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  Open: ["InProgress", "Closed", "Returned"],
  InProgress: ["PendingApproval", "Open", "DeadlineExtension"],
  PendingApproval: ["Approved", "Rejected", "Returned"],
  Approved: ["Resolved", "Closed"],
  Resolved: ["Closed"],
  Closed: [],
  Rejected: ["Open"],
  Returned: ["Open", "InProgress"],
  DeadlineExtension: ["InProgress", "PendingApproval"],
};

export function getAllowedTransitions(
  current: CaseStatus
): CaseStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}

export function useCaseTransition() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      caseId,
      targetStatus,
    }: {
      caseId: string;
      targetStatus: CaseStatus;
    }) => {
      return casesApi.transition({
        caseId,
        targetStatus,
      });
    },

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [CASES_KEY] });

      // optional: update single cache
      if (data?.id) {
        qc.setQueryData([CASES_KEY, data.id], data);
      }
    },
  });

  return {
    ...mutation,
    getAllowedTransitions,
  };
}

// import { useMutation } from "@tanstack/react-query";

// export function useCaseTransition() {
//   return useMutation({
//     mutationFn: async ({
//       caseId,
//       targetStatus,
//     }: {
//       caseId: number;
//       targetStatus: string;
//     }) => {
//       console.log("Transition:", caseId, targetStatus);
//     },
//   });
// }