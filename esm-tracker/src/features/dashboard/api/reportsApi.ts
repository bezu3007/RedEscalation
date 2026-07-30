import { apiClient } from "@/shared/lib/apiClient";
import type { AnalyticsData, DepartmentStats, DeveloperResolution, ModuleDistribution, PaymentStatusSummary, ProjectDistribution } from "../types";
import { Case_Status, type CaseItem, type CaseStatus, type CaseType } from "@/features/cases/types";

export interface AnalyticsParams {
  from?: string;
  to?: string;
  department?: string;
  projectName?: string;
}

function normalizeStatus(apiStatus: string): CaseStatus {
  const map: Record<string, CaseStatus> = {
    Accepted: "Accepted",
    Solved: "Solved",
    Fixed: "Fixed",
    Prepared: "Prepared",
    "Re Journal": "Re Journal",
    Rejected: "Rejected",
    Returned: "Returned",
    Reviewed: "Reviewed",
    "Not Solved": "Not Solved",
    "On Progress": "On Progress",
    Closed: "Closed",
    Urgent: "Urgent",
    Removed: "Removed",
  };

  return map[apiStatus] ?? "Accepted";
}

function normalizeCaseType(type: string): CaseType {
  const map: Record<string, CaseType> = {
    Performance: "Performance",
    Error: "Error",
    Report: "Report",
    "Intermitant Case": "Intermitant Case",
    "New Functionality": "New Functionality",
    Customization: "Customization",
    "Not Implemented": "Not Implemented",
  };

  return map[type] ?? "Other";
}

function mapEscalationItems(items: any[]): CaseItem[] {
  return items.map((item) => ({
    id: item.id ?? null,
    caseNumber: item.code || "",
    issueDate: item.issuedDate || "",
    projectName: item.consignee1FullName || "",
    projectNameId: item.consignee1Id || "",
    issues: item.note || "",
    paidorNot: item.extension1 || "",
    caseType: normalizeCaseType(item.extension2),
    module: item.extension3 || "",
    developmentStatus: item.extension4 || "",
    isUrgent: item.extension5 === "1364",
    parentCaseId: item.extension6 ? Number(item.extension6) : null,
    isSubcase: !!item.extension6,
    functionalConsultantId: item.consignee2Id || null,
    functionalConsultant: item.consignee2FullName || "",
    developerId: item.consignee3Id || null,
    developer: item.consignee3FullName || "",
    reviewerId: item.consignee4Id || null,
    reviewer: item.consignee4FullName || "",
    departmentId: item.consigneeUnit1Id || null,
    department: item.consigneeUnit1Description || "",
    status: normalizeStatus(item.lastStateDescription),
    releaseNote: item.remark || "",
    startDate: item.startDate || "",
    deadLine: item.deadLine || item.DeadLine || item.endDate || item.EndDate || "",
  }));
}

function buildAnalyticsFromCases(items: CaseItem[]): AnalyticsData {
  const projectMap = new Map<string, ProjectDistribution>();
  const paymentMap = new Map<string, PaymentStatusSummary>();
  const moduleMap = new Map<string, ModuleDistribution>();
  const developerMap = new Map<string, DeveloperResolution>();
  const departmentMap = new Map<string, DepartmentStats>();
  const statusCounts: Record<string, number> = {};

  let resolvedCases = 0;
  let overdueCases = 0;

  for (const item of items) {
    const projectName = item.projectName || "Unassigned";
    const paymentStatus = item.paidorNot || "Unknown";
    const moduleName = item.module || "Unassigned";
    const developerName = item.developer || "Unassigned";
    const departmentName = item.department || "Unassigned";
    const statusName = item.status || "Accepted";

    statusCounts[statusName] = (statusCounts[statusName] ?? 0) + 1;

    const projectEntry = projectMap.get(projectName) ?? {
      projectName,
      totalCases: 0,
      openCases: 0,
      resolvedCases: 0,
    };
    projectEntry.totalCases += 1;
    if (item.status === "Solved" || item.status === "Fixed" || item.status === "Closed") {
      projectEntry.resolvedCases += 1;
      resolvedCases += 1;
    } else {
      projectEntry.openCases += 1;
    }
    projectMap.set(projectName, projectEntry);

    const paymentEntry = paymentMap.get(paymentStatus) ?? {
      status: paymentStatus,
      count: 0,
      totalAmount: 0,
    };
    paymentEntry.count += 1;
    paymentMap.set(paymentStatus, paymentEntry);

    const moduleEntry = moduleMap.get(moduleName) ?? {
      moduleName,
      caseCount: 0,
    };
    moduleEntry.caseCount += 1;
    moduleMap.set(moduleName, moduleEntry);

    const developerEntry = developerMap.get(developerName) ?? {
      developerName,
      department: departmentName,
      totalAssigned: 0,
      resolved: 0,
      avgResolutionDays: 0,
      fixedCases: 0,
      overdueCases: 0,
    };
    developerEntry.totalAssigned += 1;
    if (item.status === "Solved" || item.status === "Fixed" || item.status === "Closed") {
      developerEntry.resolved += 1;
    }
    if (item.status === "Fixed") {
      developerEntry.fixedCases = (developerEntry.fixedCases ?? 0) + 1;
    }
    if (item.deadLine) {
      const deadline = new Date(item.deadLine);
      const today = new Date();
      if (!Number.isNaN(deadline.getTime()) && deadline < today) {
        overdueCases += 1;
        developerEntry.overdueCases = (developerEntry.overdueCases ?? 0) + 1;
      }
    }
    developerMap.set(developerName, developerEntry);

    const departmentEntry = departmentMap.get(departmentName) ?? {
      department: departmentName,
      totalCases: 0,
      openCases: 0,
      criticalCases: 0,
    };
    departmentEntry.totalCases += 1;
    if (item.status === "Solved" || item.status === "Fixed" || item.status === "Closed") {
      departmentEntry.openCases += 0;
    } else {
      departmentEntry.openCases += 1;
    }
    departmentMap.set(departmentName, departmentEntry);
  }

  const normalizedStatusCounts = Case_Status.reduce<Record<string, number>>((acc, status) => {
    acc[status] = statusCounts[status] ?? 0;
    return acc;
  }, {});

  return {
    totalCases: items.length,
    openCases: items.length - resolvedCases,
    resolvedCases,
    avgResolutionDays: 0,
    projectDistribution: Array.from(projectMap.values()),
    paymentStatus: Array.from(paymentMap.values()),
    moduleDistribution: Array.from(moduleMap.values()),
    developerResolution: Array.from(developerMap.values()),
    departmentStats: Array.from(departmentMap.values()),
    dateRange: { from: "", to: "" },
    overdueIssues: overdueCases,
    statusCounts: normalizedStatusCounts,
  };
}

export const reportsApi = {
  getAnalytics: async (_params?: AnalyticsParams): Promise<AnalyticsData> => {
    const response = await apiClient.get("/EscalationView/dynamic/");
    console.log("Analytics API Response:", response.data);
    const payload = response.data;
    const rawItems = Array.isArray(payload) ? payload : payload?.items ?? [];
    const mappedItems = mapEscalationItems(rawItems);
    return buildAnalyticsFromCases(mappedItems);
  },
};
