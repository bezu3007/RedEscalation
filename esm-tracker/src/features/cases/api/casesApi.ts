import { apiClient } from "@/shared/lib/apiClient";
import type {CasesResponse, CaseItem, CaseFilters, CaseStatus, CaseType, AttachmentDTO, ActivityLogView
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
    Edited: "Edited",
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
    // DeadlineExtension: "DeadlineExtension",
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
      throw error; // Re-throw to be handled by React Query
    }
  },

  getEmployee: async (isDev: boolean) => {
    try {
      if(isDev){
        const response = await apiClient.get("Consignee/dynamic", {
          params: {
            preference: 2,
            department: 56,
            isActive: true,
            }
        });
      return response.data;
      }

      else{
        const response = await apiClient.get("Consignee/dynamic", {
          params: {
            preference: 2,
            isActive: true,
            }
        });
        return response.data;
      }
    } catch (error) {
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

    const hasDateRange =
      Boolean(params.fromIssueDate?.trim()) || Boolean(params.toIssueDate?.trim());
    const hasOtherFilters = Boolean(
      params.code?.trim() ||
      params.search?.trim() ||
      params.status?.trim() ||
      params.caseType?.trim() ||
      params.module?.trim() ||
      params.paidorNot?.trim() ||
      params.projectName?.trim() ||
      params.developer?.trim() ||
      params.functionalConsultant?.trim()
    );

    if (params.code) {
      query.append("code", params.code);
    }

    else{
      if (hasDateRange) {
        if (params.fromIssueDate?.trim()) {
          query.append(":IssuedDate", params.fromIssueDate.trim());
        }
        if (params.toIssueDate?.trim()) {
          query.append("IssuedDate:", params.toIssueDate.trim());
        }
      } else if (!hasOtherFilters) {
        const today = new Date().toISOString().split("T")[0];
        query.append(":IssuedDate", today);
        query.append("IssuedDate:", today);
      }

      const developerFilterValue = params.developer?.trim();

      // ROLE-BASED FILTERING - Matches your C# logic
      if (developerFilterValue) {
        query.append("Consignee3Id", developerFilterValue);
      }
      else if (userRole === UserRole.DEVELOPER) {
        query.append("Consignee3Id", user.id.toString());
      } 
      else if (userRole === UserRole.FUNCTIONAL_CONSULTANT) {
        query.append("Consignee2Id", user.id.toString());
      } 
      else if (userRole === UserRole.PROJECT_MANAGER || userRole === UserRole.ADMIN) {
      }
      
      const functionalConsultantFilterValue = params.functionalConsultant?.trim();
      if (functionalConsultantFilterValue) {
        query.append("Consignee2Id", functionalConsultantFilterValue);
      }


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
    }
    const url = `/EscalationView/dynamic/?${query.toString()}`;

    const response = await apiClient.get(url);
    let data = response.data ?? [];

    if (params.code && data.length > 0) {
      const selected = data[0];

      // If it's a child, fetch its parent
      if (selected.extension6) {
        const parentRes = await apiClient.get(
          `/EscalationView/dynamic/?id=${selected.extension6}`
        );

        const childRes = await apiClient.get(
          `/EscalationView/dynamic/?Extension6=${selected.extension6}`
        );

        data = [
          ...(parentRes.data ?? []),
          ...(childRes.data ?? [])
        ];
      }
      // If it's a parent, fetch all children
      else {
        const childRes = await apiClient.get(
          `/EscalationView/dynamic/?Extension6=${selected.id}`
        );

        data = [
          selected,
          ...(childRes.data ?? [])
        ];
      }
    }

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
      developmentStatus: item.extension4 || "",
      isUrgent: (item.extension5 === "1364") ? true : false,
      parentCaseId: item.extension6 ? Number(item.extension6) : null,
      isSubcase: !!item.extension6,
      functionalConsultantId: item.consignee2Id || "",
      functionalConsultant: item.consignee2FullName || "",
      developerId: item.consignee3Id || "",
      developer: item.consignee3FullName || "",
      reviewerId: item.consignee4Id || "",
      reviewer: item.consignee4FullName || "",
      departmentId: item.consigneeUnit1Id || "",
      department: item.consigneeUnit1Description || "",
      status: normalizeStatus(item.lastStateDescription),
      releaseNote: item.remark || "",
      startDate: item.startDate || "",
      deadLine: item.deadLine || item.DeadLine || item.endDate || item.EndDate || "",
    }));

    const childrenMap = new Map<number, CaseItem[]>();

    mapped.forEach(c => {
      if (c.parentCaseId) {
        if (!childrenMap.has(c.parentCaseId)) {
          childrenMap.set(c.parentCaseId, []);
        }
        childrenMap.get(c.parentCaseId)!.push(c);
      }
    });

    const ordered: CaseItem[] = [];

    mapped
      .filter(c => !c.parentCaseId)
      .forEach(parent => {
        ordered.push(parent);
        ordered.push(...(childrenMap.get(parent.id ?? 0) ?? []));
      });

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

    const response = await apiClient.get(url);

    const item = response.data;

    if (!item) {
      throw new Error("Case not found");
    }

    const mapped: CaseItem = {
      id: item.id,
      caseNumber: item.code,
      issueDate: item.issueDate,
      projectNameId: item.consignee1Id || "",
      projectName: item.consignee1FullName || "",
      issues: item.Note || "",
      paidorNot: item.Extension1 || "",
      caseType: normalizeCaseType(item.Extension2),
      module: item.Extension3 || "",
      developmentStatus: item.Extension4 || "",
      isUrgent: (item.extension5 === "1364") ? true : false,
      parentCaseId: item.extension6 ? Number(item.extension6) : null,
      isSubcase: !!item.extension6,
      functionalConsultantId: item.consignee2Id || "",
      functionalConsultant: item.consignee2FullName || "",
      developerId: item.consignee3Id || "",
      developer: item.consignee3FullName || "",
      reviewerId: item.consignee4Id || "",
      reviewer: item.consignee4FullName || "",
      departmentId: item.ConsigneeUnit1Id || "",
      department: item.ConsigneeUnit1Description || "",
      status: normalizeStatus(item.LastStateDescription),
      releaseNote: item.Remark || "",
      startDate: item.StartDate || "",
      deadLine: item.DeadLine || item.deadLine || item.EndDate || item.endDate || "",
    };
    return mapped;
  },

  create: async (body: any) => {
    const res = await apiClient.post("/VoucherBuffer", body);
    return res.data.data.voucher;
  },

  update: async (body: any) => {
    const res = await apiClient.put(`/VoucherBuffer`, body);

    return res.data.data.voucher
  },

  ///////////////////////// Attachment API Calls /////////////////////////

  createAttachment: async (attachment: AttachmentDTO) => {
    const res = await apiClient.post("/Attachment", attachment);
    return res.data;
  },

  updateAttachment: async (attachment: AttachmentDTO) => {
    const res = await apiClient.put("/Attachment", attachment);
    return res.data;
  },

  getAttachments: async (reference: number): Promise<AttachmentDTO[]> => {
    // CommonLibrary/ftp_file_preview/?path=0076217301/Transaction/ESMTracker
    const res = await apiClient.get("/Attachment/filter", {
      params: {
        Reference: reference,
        Pointer: 767,
      },
    });

    return res.data;
  },

  getAttachmentPreview: async (path: string): Promise<string> => {
    const normalizedPath = path
      ?.replace(/^ftp:\/\//i, "")
      ?.replace(/^\\\\/i, "")
      ?.replace(/^[A-Za-z]:\\/i, "")
      ?.replace(/^\/+/i, "")
      ?.trim();

    const res = await apiClient.get("/CommonLibrary/ftp_file_preview", {
      params: {
        path: normalizedPath || path,
      },
      responseType: "blob", // Expecting a binary response
    });

    return URL.createObjectURL(res.data);
  },

  deleteAttachment: async (attachmentId: number) => {
    const res = await apiClient.delete(`/Attachment/${attachmentId}`);
    return res.data;
  },

  getActivityLog: async (caseId: number): Promise<any[]> => {
    const res = await apiClient.get("ActivityView/dynamic", {
      params: {
        Reference: caseId,
      },
    });
    const ActivityLog = res.data;

    const mappedLog: ActivityLogView[] = ActivityLog.map((item: any) => ({
      id: item.id,
      pointer: item.pointer,
      reference: item.reference,
      code: item.code,
      activityDefinition: item.activityDefinition,
      consigneeUnit: item.consigneeUnit,
      organizationUnitDefnDesc: item.organizationUnitDefnDesc,
      timeStamp: item.timeStamp,
      day: item.day,
      user: item.user,
      userName: item.userName,
      platform: item.platform,
      remark: item.remark || "",
    }));

    return mappedLog;
  },

};