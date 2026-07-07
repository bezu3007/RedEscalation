import { apiClient } from "@/shared/lib/apiClient";
import type {CasesResponse, CaseItem, CaseFilters, CaseStatus, CaseType, VoucherBuffer,
  // Developer,
  // AiSuggestDevelopersResponse,
} from "../types";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";

export interface CasesQueryParams
  extends Partial<CaseFilters> {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  userRole?: UserRole;
  userId?: number;
  departmentId?: number;
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
    try {
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
    } catch (error) {
      console.error("Voucher init error:", error);
      throw error; // Re-throw to be handled by React Query
    }
  },

  getAll: async (params: CasesQueryParams): Promise<CasesResponse> => {
    const query = new URLSearchParams();

    // Get current user from auth store
    const user = useAuthStore.getState().user;
    const userRole = useAuthStore.getState().getUserRole();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("Current user:", user);
    console.log("User role:", userRole);

    query.append(":IssuedDate", params.fromIssueDate!);
    query.append("IssuedDate:", params.toIssueDate!);

    // ROLE-BASED FILTERING - Matches your C# logic
    if (userRole === UserRole.DEVELOPER) {
      query.append("Consignee3Id", user.id.toString());
      console.log("Developer filter - Consignee3Id:", user.id);
    } 
    else if (userRole === UserRole.FUNCTIONAL_CONSULTANT) {
      query.append("Consignee2Id", user.id.toString());
      console.log("FC filter - Consignee2Id:", user.id);
    } 
    else if (userRole === UserRole.PROJECT_MANAGER || userRole === UserRole.ADMIN) {
    //   // query.append("Consignee2Id", user.id.toString());
    //   console.log("PM filter - Consignee2Id:", user.id);
    // } 
    // else if (userRole === UserRole.ADMIN) {
    //   // if (!params.status) {
    //   //   query.append("LastStateDescription", "Reviewed");
    //   // }
      console.log("PM & Admin - no filter applied (viewing all)");
    }

    // Additional filters (if provided by user)
    if (params.caseType) {
      query.append("Extension2", params.caseType);
    }
    if (params.status) {
      query.append("LastStateDescription", params.status);
    }
    if (params.module) {
      query.append("Extension3", params.module);
    }
    if (params.paidorNot) {
      query.append("Extension1", params.paidorNot);
    }
    if (params.projectName) {
      query.append("Consignee1Id", params.projectName);
    }

    const url = `/EscalationView/dynamic/?${query.toString()}`;
    console.log("API URL:", url);

    const response = await apiClient.get(url);
    const data = response.data ?? [];

    const mapped: CaseItem[] = data.map((item: any) => ({
      id: item.id,
      caseNumber: item.code || "",
      issueDate: item.issuedDate || "",
      projectName: item.consignee1FullName || "",
      projectNameId: item.consignee1Id || "",
      issues: item.note || "",
      paidorNot: item.extension1 || "",
      caseType: normalizeCaseType(item.extension2),
      module: item.extension3 || "",
      functionalConsultant: item.consignee2FullName || "",
      functionalConsultantId: item.consignee2Id || "",
      reviewedBy: item.consignee4FullName || "",
      developer: item.consignee3FullName || "",
      developerId: item.consignee3Id || "",
      department: item.consigneeUnit1Description || "",
      departmentId: item.consigneeUnit1Id || "",
      developmentStatus: item.extension4 || "",
      UATStatus: item.lastStateDescription || "",
      status: normalizeStatus(item.lastStateDescription),
      releaseNote: item.remark || "",
      startDate: item.startDate || "",
      deadLine: item.deadLine || "",
      referencedID: item.id || "",
      attachmentUrl: item.attachmentUrl || "",
    }));

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
      projectNameId: item.consignee1Id || "",
      issues: item.Note || "",
      paidorNot: item.Extension1 || "",
      caseType: normalizeCaseType(item.Extension2),
      module: item.Extension3 || "",
      functionalConsultant: item.consignee2FullName || "",
      functionalConsultantId: item.consignee2Id || "",
      reviewedBy: item.consignee4FullName || "",
      developer: item.consignee3FullName || "",
      developerId: item.consignee3Id || "",
      department: item.ConsigneeUnit1Description || "",
      departmentId: item.ConsigneeUnit1Id || "",
      developmentStatus: item.Extension4 || "",
      UATStatus: item.LastStateDescription || "",
      status: normalizeStatus(item.LastStateDescription),
      releaseNote: item.Remark || "",
      startDate: item.StartDate || "",
      deadLine: item.DeadLine || "",
      referencedId: item.Id || "",
      attachmentUrl: item.attachmentUrl || "",
    };
    console.log(mapped);
    return mapped;
  },

  getVoucherById: async (id: number): Promise<CaseItem> => {
    const url = `/Voucher/dynamic?id=${id}`;

    console.log("GET BY ID URL:", url);

    const response = await apiClient.get(url);

    console.log("GET BY ID RESPONSE:", response.data);

    const item = response.data;
    console.log("Fetched voucher1 item:", item);

    if (!item) {
      throw new Error("Case not found");
    }

    return item;
  },

  create: async (body: any) => {
    const res = await apiClient.post("/VoucherBuffer", body);
    return res.data;
  },

  update: async (body: VoucherBuffer) => {
    const res = await apiClient.put(`/VoucherBuffer`, body);

    return res.data;
  },

  // transition: async ({
  //   caseId,
  //   targetStatus,
  // }: {
  //   caseId: string;
  //   targetStatus: CaseStatus;
  // }) => {

  //   const voucher = await casesApi.getVoucherById(Number(caseId));
  //   const currentStatusId = mapStatusToId(targetStatus);
  //   // voucher.lastState = currentStatusId;

  //   const response = await apiClient.post(
  //     `/VoucherBuffer/${caseId}/transition`,
  //     {
  //       targetStatus,
  //     }
  //   );

  //   return response.data;
  // },

};