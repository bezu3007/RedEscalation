import { apiClient } from "@/shared/lib/apiClient";
import type {CasesResponse, CaseItem, CaseStatus, CaseType, AttachmentDTO, ActivityLogView
  // Developer,
  // AiSuggestDevelopersResponse,
} from "../types";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";

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

  getAll: async (): Promise<CasesResponse> => {
    // Get current user from auth store
    const user = useAuthStore.getState().user;
    const userRole = useAuthStore.getState().getUserRole();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await apiClient.get("/EscalationView/dynamic/", {
      params: userRole === UserRole.DEVELOPER
        ? { Consignee3Id: user.id }
        : undefined,
    });
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
      developmentStatus: item.extension4 || "",
      isUrgent: (item.extension5 === "1364") ? true : false,
      parentCaseId: item.extension6 ? Number(item.extension6) : null,
      isSubcase: !!item.extension6,
      functionalConsultantId: item.consignee2Id || "",
      functionalConsultant: item.consignee2FullName || "",
      fcDepartmentId: item.consigneeUnit2Id || "",
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

    return {
      items: mapped,
      totalCount: mapped.length,
      page: 1,
      pageSize: mapped.length,
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
      fcDepartmentId: item.consigneeUnit2Id || "",
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
    
    console.log(res.data);
    

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