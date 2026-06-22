import { apiClient } from "@/shared/lib/apiClient";
import type {
  CasesResponse,
  CaseItem,
  CaseFilters,
  CreateCaseRequest,
  UpdateCaseRequest,
  CaseTransitionRequest,
  Developer,
  AiSuggestDevelopersResponse,
} from "../types";

export interface CasesQueryParams extends Partial<CaseFilters> {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export const casesApi = {
  getAll: (params: CasesQueryParams): Promise<CasesResponse> =>
    // Return mock data in dev for a faster local UX when backend is unavailable
    (import.meta.env.DEV
      ? Promise.resolve(
          ((): CasesResponse => {
            const statuses = ["Open", "InProgress", "Resolved"] as const;

const caseTypes = [
  "Bug",
  "FeatureRequest",
  "Support",
  "Other",
] as const;

const priorities = ["Low", "Medium", "High", "Critical"] as const;

const departments = [
  "Engineering",
  "Finance",
  "HR",
  "Operations",
] as const;

const developers = ["Alice", "Bob", "John", "Sarah", "Michael"];

const items: CaseItem[] = Array.from({ length: 10000 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    caseNumber: `C-${1000 + id}`,
    title: `Sample Case ${id}`,
    description: `This is a generated dummy case number ${id}`,
    status: statuses[index % statuses.length],
    caseType: caseTypes[index % caseTypes.length],
    priority: priorities[index % priorities.length],
    projectName: `Project ${(id % 5) + 1}`,
    moduleName: `Module ${(id % 10) + 1}`,
    department: departments[index % departments.length],
    reportedBy: `user${id}@example.com`,
    assignedDeveloper: developers[index % developers.length],
    assignedDeveloperId: `dev-${(id % developers.length) + 1}`,
    voucherNumber: id % 3 === 0 ? `V-${id}` : null,
    paymentStatus:
      id % 3 === 0
        ? id % 2 === 0
          ? "Paid"
          : "Pending"
        : null,
    paymentAmount: id % 3 === 0 ? Number((Math.random() * 5000).toFixed(2)) : null,
    attachmentUrl: null,
    createdAt: new Date(
      Date.now() - id * 1000 * 60 * 60
    ).toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: id % 5 === 0 ? new Date().toISOString() : null,
  };
});

            return {
              items,
              totalCount: items.length,
              page: params.page ?? 1,
              pageSize: params.pageSize ?? items.length,
            };
          })()
        )
      : apiClient.get("/cases", { params }).then((r) => r.data)),

  getById: (id: number): Promise<CaseItem> =>
    (import.meta.env.DEV
      ? Promise.resolve({
          id,
          caseNumber: `C-1${id}`,
          title: `Sample case ${id}`,
          description: "This is a mock case for local development",
          status: "Open",
          caseType: "Other",
          priority: "Low",
          projectName: "ESM",
          moduleName: "Core",
          department: "Engineering",
          reportedBy: "dev@example.com",
          assignedDeveloper: null,
          assignedDeveloperId: null,
          voucherNumber: null,
          paymentStatus: null,
          paymentAmount: null,
          attachmentUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolvedAt: null,
        })
      : apiClient.get(`/cases/${id}`).then((r) => r.data)),

  create: (body: CreateCaseRequest): Promise<CaseItem> =>
    apiClient.post("/cases", body).then((r) => r.data),

  update: (id: number, body: UpdateCaseRequest): Promise<CaseItem> =>
    apiClient.patch(`/cases/${id}`, body).then((r) => r.data),

  transition: (body: CaseTransitionRequest): Promise<CaseItem> =>
    apiClient
      .post(`/cases/${body.caseId}/transition`, body)
      .then((r) => r.data),

  uploadAttachment: (caseId: number, file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post(`/cases/${caseId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  getDevelopers: (): Promise<Developer[]> =>
    (import.meta.env.DEV
      ? Promise.resolve([
          { id: "dev-1", name: "Alice", department: "Engineering", activeCaseCount: 2 },
          { id: "dev-2", name: "Bob", department: "Finance", activeCaseCount: 1 },
        ])
      : apiClient.get("/developers").then((r) => r.data)),

  aiSuggestDevelopers: (
    caseId: number
  ): Promise<AiSuggestDevelopersResponse> =>
    apiClient.post(`/ai/suggest-developers`, { caseId }).then((r) => r.data),

  exportToPdf: (caseId: number): Promise<Blob> =>
    apiClient
      .get(`/cases/${caseId}/export/pdf`, { responseType: "blob" })
      .then((r) => r.data),
};