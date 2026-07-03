import type { CaseStatus } from "../types";

export function mapStatusToId(status: CaseStatus): number {
  const statusMap: Record<CaseStatus, number> = {
    Prepared: 1305,
    Review: 1306,
    Returned: 1307,
    Rejected: 1308,
    Approved: 1309,
    OnProgress: 1310,
    Solved: 1311,
    NotSolved: 1312,
    Accepted: 1313,
    Fixed: 1314,
    "Re Journal": 1315,
    Reviewed: 1316,
    "On Progress": 1317,
    Closed: 1318,
    Open: 1319,
    InProgress: 1320,
    PendingApproval: 1321,
    Resolved: 1322,
    DeadlineExtension: 1323,
  };
  
  return statusMap[status] || 1305; // Default to Prepared
}

export function mapIdToStatus(id: number): CaseStatus {
  const statusMap: Record<number, CaseStatus> = {
    1305: "Prepared",
    1306: "Review",
    1307: "Returned",
    1308: "Rejected",
    1309: "Approved",
    1310: "OnProgress",
    1311: "Solved",
    1312: "NotSolved",
    1313: "Accepted",
    1314: "Fixed",
    1315: "Re Journal",
    1316: "Reviewed",
    1317: "On Progress",
    1318: "Closed",
    1319: "Open",
    1320: "InProgress",
    1321: "PendingApproval",
    1322: "Resolved",
    1323: "DeadlineExtension",
  };
  
  return statusMap[id] || "Prepared";
}