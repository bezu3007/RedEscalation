export interface Voucher {
  id: string;
  voucherCode: string;
  projectContext: string;
  caseType: "Bug" | "Feature" | "Improvement";
  module: string;
  status: "ON PROGRESS" | "SOLVED" | "RETURNED";
  assignedSquad: string;
  issueDate: string;
  deadline: string;
  project: string;
}

export interface FilterState {
  project: string;
  module: string;
  caseType: string;
  status: string;
  reportedAfter: string;
  reportedBefore: string;
}
export interface ProjectDistribution {
  projectName: string;
  totalCases: number;
  openCases: number;
  resolvedCases: number;
}

export interface PaymentStatusSummary {
  status: string;
  count: number;
  totalAmount: number;
}

export interface ModuleDistribution {
  moduleName: string;
  caseCount: number;
}

export interface DeveloperResolution {
  developerName: string;
  department: string;
  totalAssigned: number;
  resolved: number;
  avgResolutionDays: number;
  fixedCases?: number;
  overdueCases?: number;
}

export interface DepartmentStats {
  department: string;
  totalCases: number;
  openCases: number;
  criticalCases: number;
}

export interface AnalyticsData {
  totalCases: number;
  openCases: number;
  resolvedCases: number;
  avgResolutionDays: number;
  totalIssues?: number;
  resolvedIssues?: number;
  overdueIssues?: number;
  overdueCases?: number;
  issuesWithDeadLinePassed?: number;
  statusCounts?: Record<string, number>;
  projectDistribution: ProjectDistribution[];
  paymentStatus: PaymentStatusSummary[];
  moduleDistribution: ModuleDistribution[];
  developerResolution: DeveloperResolution[];
  departmentStats: DepartmentStats[];
  dateRange: { from: string; to: string };
}