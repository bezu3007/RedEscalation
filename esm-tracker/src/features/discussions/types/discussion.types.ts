export interface OpenDiscussionRequest {
  caseId: string | number;
  caseNumber: string;
  issueDate?: string;
  projectName?: string;
  projectNameId?: string | number;
  issue: string;
  caseType?: string;
  module?: string;
  developmentStatus?: string;
  isUrgent?: boolean;
  status?: string;

  functionalConsultant: {
    employeeId?: string;
    name?: string;
  };

  developer: {
    employeeId: string;
    name?: string;
  };

  reviewer?: {
    employeeId?: string;
    name?: string;
  };
}

export type MembershipStatus =
  | "NOT_INVITED"
  | "INVITED"
  | "PENDING_APPROVAL"
  | "JOINED"
  | "LEFT"
  | "REVOKED";

export interface ParticipantSyncResult {
  employeeId: string;
  name: string;
  role: "DEVELOPER" | "FC" | "REVIEWER";
  telegramIdMapped: boolean;
  membershipStatus: MembershipStatus;
  action:
    | "ALREADY_MEMBER"
    | "INVITED"
    | "INVITE_REUSED"
    | "REQUIRES_BOT_START"
    | "UNMAPPED_TELEGRAM_ID"
    | "CHECK_FAILED";
  instruction?: string;
}

export interface OpenDiscussionResponse {
  success: boolean;
  existing: boolean;
  caseId: string;
  caseNumber: string;
  groupId: string;
  messageThreadId: number;
  status: "OPEN" | "CLOSED";
  message: string;
  participants?: ParticipantSyncResult[];
}