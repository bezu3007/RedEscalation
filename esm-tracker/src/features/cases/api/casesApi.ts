import { apiClient } from "@/shared/lib/apiClient";
import type {CasesResponse, CaseItem, CaseFilters, CaseStatus, CaseType, VoucherBuffer,
  // Developer,
  // AiSuggestDevelopersResponse,
} from "../types";

export interface CasesQueryParams
  extends Partial<CaseFilters> {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
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

export const casesApi = {

  voucherInit: async () => {
    const response = await apiClient.get(
      "/TransactionLibrary/voucher-init",
      {
        params: {
          voucherDefn: 400,
          consigneeUnit_id: 3,
          userId: 94,
          isWeb: true,
        },
      }
    );

    return response.data;
  },

  getAll: async (params: CasesQueryParams): Promise<CasesResponse> => {

    const query = new URLSearchParams();

    query.append(":IssuedDate", params.fromIssueDate!);
    query.append(":IssuedDate", params.toIssueDate!);

    query.append("Consignee3Id","183" );

    if (params.caseType) {
      query.append(
        "Extension2",
        params.caseType
      );
    }

    if (params.status) {
      query.append(
        "LastStateDescription",
        params.status
      );
    }

    if (params.module) {
      query.append(
        "Extension3",
        params.module
      );
    }

    if (params.paidorNot) {
      query.append(
        "Extension1",
        params.paidorNot
      );
    }

    const url =
      `/EscalationView/dynamic/?${query.toString()}`;

    const response = await apiClient.get(url);

    const data = response.data ?? [];

    const mapped: CaseItem[] = data.map(
      (item: any) => ({
        id: item.id,
        caseNumber: item.code,

        issueDate: item.issuedDate,

        projectName:
          item.consignee1FullName || "",

        projectNameID:
          item.consignee1Id || "",

        issues:
          item.note || "",

        paidorNot:
          item.extension1 || "",

        caseType:
          normalizeCaseType(item.extension2),

        module:
          item.extension3 || "",

        functionalConsultant:
          item.consignee2FullName || "",

        functionalConsultantID:
          item.consignee2Id || "",

        reviewedBy:
          item.consignee4FullName || "",

        developer:
          item.consignee3FullName || "",

        developerID:
          item.consignee3Id || "",

        department:
          item.consigneeUnit1Description || "",

        departmentID:
          item.consigneeUnit1Id || "",

        developmentStatus:
          item.extension4 || "",

        UATStatus:
          item.lastStateDescription || "",

        status:
          normalizeStatus(
            item.lastStateDescription
          ),

        releaseNote:
          item.remark || "",

        startDate:
          item.startDate || "",

        deadLine:
          item.deadLine || "",

        referencedID:
          item.id || "",
        attachmentUrl: item.attachmentUrl || "",
      })
    );

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: mapped.slice(start, end),
      totalCount: mapped.length,
      page,
      pageSize,
    };
  },

  getById: async (id: number): Promise<CaseItem> => {
    const url = `/EscalationView/${id}`;

    console.log("GET BY ID URL:", url);

    const response = await apiClient.get(url);

    console.log("GET BY ID RESPONSE:", response.data);

    const item = response.data;

    if (!item) {
      throw new Error("Case not found");
    }

    const mapped: CaseItem = {
      id: item.id,
      caseNumber: item.code,
      issueDate: item.issueDate,
      projectName: item.consignee1FullName || "",
      projectNameID: item.consignee1Id || "",
      issues: item.Note || "",
      paidorNot: item.Extension1 || "",
      caseType: normalizeCaseType(item.Extension2),
      module: item.Extension3 || "",
      functionalConsultant: item.consignee2FullName || "",
      functionalConsultantID: item.consignee2Id || "",
      reviewedBy: item.consignee4FullName || "",
      developer: item.consignee3FullName || "",
      developerId: item.consignee3Id || "",
      department: item.ConsigneeUnit1Description || "",
      departmentID: item.ConsigneeUnit1Id || "",
      developmentStatus: item.Extension4 || "",
      UATStatus: item.LastStateDescription || "",
      status: normalizeStatus(item.LastStateDescription),
      releaseNote: item.Remark || "",
      startDate: item.StartDate || "",
      deadLine: item.DeadLine || "",
      referencedID: item.Id || "",
      attachmentUrl: item.attachmentUrl || "",
    };
    console.log(mapped);
    return mapped;
  },

  create: async (body: any) => {
    const res = await apiClient.post("/VoucherBuffer", body);
    return res.data;
  },

  update: async (id: number, body: VoucherBuffer) => {
    const res = await apiClient.put(
      `/VoucherBuffer/${id}`, // or whatever your API expects
      body
    );

    return res.data;
  },

  transition: async ({
    caseId,
    targetStatus,
  }: {
    caseId: string;
    targetStatus: CaseStatus;
  }) => {
    const response = await apiClient.post(
      `/EscalationView/${caseId}/transition`,
      {
        targetStatus,
      }
    );

    return response.data;
  },

  //   return apiClient
  //     .post(
  //       `/cases/${body.caseId}/transition`,
  //       body
  //     )
  //     .then((r) => r.data);
  // },


  //////////////////////////////////////////////
  /////////Mock use//////////////////////////////
  // uploadAttachment: (
  //   caseId: number,
  //   file: File
  // ): Promise<{ url: string }> => {
  //   const form = new FormData();

  //   form.append("file", file);

  //   return apiClient
  //     .post(
  //       `/cases/${caseId}/attachments`,
  //       form,
  //       {
  //         headers: {
  //           "Content-Type":
  //             "multipart/form-data",
  //         },
  //       }
  //     )
  //     .then((r) => r.data);
  // },

  // getDevelopers: (): Promise<
  //   Developer[]
  // > =>
  //   import.meta.env.DEV
  //     ? Promise.resolve([
  //         {
  //           id: "dev-1",

  //           name: "Alice",

  //           department:
  //             "Engineering",

  //           activeCaseCount: 2,
  //         },

  //         {
  //           id: "dev-2",

  //           name: "Bob",

  //           department: "Finance",

  //           activeCaseCount: 1,
  //         },
  //       ])
  //     : apiClient
  //         .get("/developers")
  //         .then((r) => r.data),

  // aiSuggestDevelopers: (
  //   caseId: number
  // ): Promise<AiSuggestDevelopersResponse> =>
  //   apiClient
  //     .post(
  //       `/ai/suggest-developers`,
  //       { caseId }
  //     )
  //     .then((r) => r.data),

  // exportToPdf: (
  //   caseId: number
  // ): Promise<Blob> =>
  //   apiClient
  //     .get(
  //       `/cases/${caseId}/export/pdf`,
  //       {
  //         responseType: "blob",
  //       }
  //     )
  //     .then((r) => r.data),
};