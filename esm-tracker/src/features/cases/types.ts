// export type CaseStatus =
//   | "Open"
//   | "InProgress"
//   | "PendingApproval"
//   | "Resolved"
//   | "Closed"
//   | "Rejected";
export type CaseStatus =
  | "Open"
  | "InProgress"
  | "PendingApproval"
  | "Approved"
  | "Resolved"
  | "Closed"
  | "Rejected"
  | "Returned"
  | "DeadlineExtension";

export type CaseType =
  | "Bug"
  | "FeatureRequest"
  | "Support"
  | "Payment"
  | "Infrastructure"
  | "Other";

export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export interface CaseItem {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  caseType: CaseType;
  priority: CasePriority;
  projectName: string;
  moduleName: string;
  department: string;
  reportedBy: string;
  assignedDeveloper: string | null;
  assignedDeveloperId: string | null;
  voucherNumber: string | null;
  paymentStatus: string | null;
  paymentAmount: number | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  aiSuggestedDeveloper?: string | null;
}

export interface CaseFilters {
  search: string;
  status: CaseStatus | "";
  caseType: CaseType | "";
  priority: CasePriority | "";
  department: string;
  projectName: string;
  assignedDeveloper: string;
  dateFrom: string;
  dateTo: string;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  caseType: CaseType;
  priority: CasePriority;
  projectName: string;
  moduleName: string;
  department: string;
  voucherNumber?: string;
  paymentAmount?: number;
}

export interface UpdateCaseRequest extends Partial<CreateCaseRequest> {
  assignedDeveloperId?: string;
  status?: CaseStatus;
}

export interface CaseTransitionRequest {
  caseId: number;
  targetStatus: CaseStatus;
  comment?: string;
}

export interface CasesResponse {
  items: CaseItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Developer {
  id: string;
  name: string;
  department: string;
  activeCaseCount: number;
}

export interface AiSuggestDevelopersResponse {
  suggestions: Array<{
    developer: Developer;
    score: number;
    reason: string;
  }>;
}