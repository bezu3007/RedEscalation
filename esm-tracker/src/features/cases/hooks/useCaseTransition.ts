// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { casesApi } from "../api/casesApi";
// import { CASES_KEY } from "./useCases";
// import type { CaseStatus, CaseItem } from "../types";

// const CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
//   Accepted: ["On Progress", "Rejected"],

//   "On Progress": [
//     "Fixed",
//     "Not Solved",
//     "Returned",
//   ],

//   Fixed: ["Reviewed"],

//   Reviewed: ["Solved", "Returned"],

//   Solved: [],

//   Rejected: [],

//   Returned: ["On Progress"],

//   Prepared: ["Reviewed"],

//   "Re Journal": ["Reviewed"],

//   "Not Solved": ["On Progress"],
// };

// export function getAllowedTransitions(
//   status: CaseStatus
// ): CaseStatus[] {
//   return CASE_TRANSITIONS[status] ?? [];
// }

// export function useCaseTransition() {
//   const qc = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: ({
//       caseId,
//       targetStatus,
//     }: {
//       caseId: string;
//       targetStatus: CaseStatus;
//     }) => {
//       return casesApi.transition({
//         caseId,
//         targetStatus,
//       });
//     },

//     onSuccess: (data) => {
//       qc.invalidateQueries({ queryKey: [CASES_KEY] });

//       // optional: update single cache
//       if (data?.id) {
//         qc.setQueryData([CASES_KEY, data.id], data);
//       }
//     },
//   });

//   return {
//     ...mutation,
//     getAllowedTransitions,
//   };
// }