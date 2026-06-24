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

export interface CasesQueryParams
  extends Partial<CaseFilters> {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

/* -------------------------------- */
/* MOCK DATA */
/* -------------------------------- */

const statuses = [
  "Open",
  "InProgress",
  "PendingApproval",
  "Resolved",
  "Closed",
] as const;

const caseTypes = [
  "Bug",
  "FeatureRequest",
  "Support",
  "Other",
] as const;

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

const departments = [
  "Engineering",
  "Finance",
  "HR",
  "Operations",
] as const;

const developers = [
  "Alice",
  "Bob",
  "John",
  "Sarah",
  "Michael",
];

let mockCases: CaseItem[] = Array.from(
  { length: 5 },
  (_, index) => {
    const id = index + 1;

    return {
      id,

      caseNumber: `C-${1000 + id}`,

      title: `Sample Case ${id}`,

      description: `This is a generated dummy case number ${id}`,

      status: statuses[index % statuses.length],

      caseType:
        caseTypes[index % caseTypes.length],

      priority:
        priorities[index % priorities.length],

      projectName: `Project ${
        (id % 5) + 1
      }`,

      moduleName: `Module ${
        (id % 10) + 1
      }`,

      department:
        departments[index % departments.length],

      reportedBy: `user${id}@example.com`,

      assignedDeveloper:
        developers[index % developers.length],

      assignedDeveloperId: `dev-${
        (id % developers.length) + 1
      }`,

      voucherNumber:
        id % 3 === 0 ? `V-${id}` : null,

      paymentStatus:
        id % 3 === 0
          ? id % 2 === 0
            ? "Paid"
            : "Pending"
          : null,

      paymentAmount:
        id % 3 === 0
          ? Number(
              (
                Math.random() * 5000
              ).toFixed(2)
            )
          : null,

      attachmentUrl: null,

      createdAt: new Date(
        Date.now() -
          id * 1000 * 60 * 60
      ).toISOString(),

      updatedAt:
        new Date().toISOString(),

      resolvedAt:
        id % 5 === 0
          ? new Date().toISOString()
          : null,
    };
  }
);

export const casesApi = {
  getAll: (
    params: CasesQueryParams
  ): Promise<CasesResponse> =>
    import.meta.env.DEV
      ? Promise.resolve(
          (() => {
            let filtered = [...mockCases];

            if (params.search) {
              const search =
                params.search.toLowerCase();

              filtered = filtered.filter(
                (item) =>
                  item.title
                    .toLowerCase()
                    .includes(search) ||
                  item.caseNumber
                    .toLowerCase()
                    .includes(search) ||
                  item.description
                    .toLowerCase()
                    .includes(search)
              );
            }

            if (params.status) {
              filtered = filtered.filter(
                (item) =>
                  item.status ===
                  params.status
              );
            }

            if (params.caseType) {
              filtered = filtered.filter(
                (item) =>
                  item.caseType ===
                  params.caseType
              );
            }

            if (params.priority) {
              filtered = filtered.filter(
                (item) =>
                  item.priority ===
                  params.priority
              );
            }

            const page =
              params.page ?? 1;

            const pageSize =
              params.pageSize ?? 25;

            const start =
              (page - 1) * pageSize;

            const end =
              start + pageSize;

            const pagedItems =
              filtered.slice(start, end);

            return {
              items: pagedItems,

              totalCount:
                filtered.length,

              page,

              pageSize,
            };
          })()
        )
      : apiClient
          .get("/cases", { params })
          .then((r) => r.data),

  getById: (
    id: number
  ): Promise<CaseItem> =>
    import.meta.env.DEV
      ? Promise.resolve(
          mockCases.find(
            (c) => c.id === id
          ) as CaseItem
        )
      : apiClient
          .get(`/cases/${id}`)
          .then((r) => r.data),

  create: (
    body: CreateCaseRequest
  ): Promise<CaseItem> =>
    apiClient
      .post("/cases", body)
      .then((r) => r.data),

  update: (
    id: number,
    body: UpdateCaseRequest
  ): Promise<CaseItem> =>
    apiClient
      .patch(`/cases/${id}`, body)
      .then((r) => r.data),

  transition: (
    body: CaseTransitionRequest
  ): Promise<CaseItem> => {
    if (import.meta.env.DEV) {
      const index =
        mockCases.findIndex(
          (c) =>
            c.id === body.caseId
        );

      if (index === -1) {
        return Promise.reject(
          new Error(
            "Case not found"
          )
        );
      }

      mockCases[index] = {
        ...mockCases[index],

        status:
          body.targetStatus,

        updatedAt:
          new Date().toISOString(),
      };

      return Promise.resolve(
        mockCases[index]
      );
    }

    return apiClient
      .post(
        `/cases/${body.caseId}/transition`,
        body
      )
      .then((r) => r.data);
  },

  uploadAttachment: (
    caseId: number,
    file: File
  ): Promise<{ url: string }> => {
    const form = new FormData();

    form.append("file", file);

    return apiClient
      .post(
        `/cases/${caseId}/attachments`,
        form,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      )
      .then((r) => r.data);
  },

  getDevelopers: (): Promise<
    Developer[]
  > =>
    import.meta.env.DEV
      ? Promise.resolve([
          {
            id: "dev-1",

            name: "Alice",

            department:
              "Engineering",

            activeCaseCount: 2,
          },

          {
            id: "dev-2",

            name: "Bob",

            department: "Finance",

            activeCaseCount: 1,
          },
        ])
      : apiClient
          .get("/developers")
          .then((r) => r.data),

  aiSuggestDevelopers: (
    caseId: number
  ): Promise<AiSuggestDevelopersResponse> =>
    apiClient
      .post(
        `/ai/suggest-developers`,
        { caseId }
      )
      .then((r) => r.data),

  exportToPdf: (
    caseId: number
  ): Promise<Blob> =>
    apiClient
      .get(
        `/cases/${caseId}/export/pdf`,
        {
          responseType: "blob",
        }
      )
      .then((r) => r.data),
};