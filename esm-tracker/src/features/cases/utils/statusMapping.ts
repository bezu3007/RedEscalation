import type { CaseStatus } from "../types";

export function mapStatusToId(status: CaseStatus): number {
  const statusMap: Record<CaseStatus, number> = {
    "Prepared": 1305,
    "Edited": 1290,
    "Reviewed": 1343,
    "Returned": 1337,
    "Rejected": 1344,
    "On Progress": 3208,
    "Solved": 1338,
    "Not Solved": 1340,
    "Accepted": 1342,
    "Fixed": 1345,
    // "Closed": 1319,
    "Urgent": 1364,
    "Removed": 1309,
    // DeadlineExtension: 1323,
  };
  
  return statusMap[status] || 1305; // Default to Prepared
}

export function mapIdToStatus(id: number): CaseStatus {
  const statusMap: Record<number, CaseStatus> = {
    1305: "Prepared",
    1290: "Edited",
    1343: "Reviewed",
    1337: "Returned",
    1344: "Rejected",
    3208: "On Progress",
    1338: "Solved",
    1340: "Not Solved",
    1342: "Accepted",
    1345: "Fixed",
    // 1319: "Closed",
    1364: "Urgent",
    1309: "Removed",
    // 1323: "DeadlineExtension",
  };
  
  return statusMap[id] || "Prepared";
}