import type { CaseStatus } from "../types";

export function mapStatusToId(status: CaseStatus): number {
  const statusMap: Record<CaseStatus, number> = {
    "Prepared": 1305,
    "Review": 1343,
    "Returned": 1337,
    "Rejected": 1344,
    "OnProgress": 3208,
    "Solved": 1338,
    "NotSolved": 1340,
    "Accepted": 1342,
    "Fixed": 1345,
    // DeadlineExtension: 1323,
  };
  
  return statusMap[status] || 1305; // Default to Prepared
}

export function mapIdToStatus(id: number): CaseStatus {
  const statusMap: Record<number, CaseStatus> = {
    1305: "Prepared",
    1343: "Review",
    1337: "Returned",
    1344: "Rejected",
    3208: "OnProgress",
    1338: "Solved",
    1340: "NotSolved",
    1342: "Accepted",
    1345: "Fixed",
    // 1323: "DeadlineExtension",
  };
  
  return statusMap[id] || "Prepared";
}