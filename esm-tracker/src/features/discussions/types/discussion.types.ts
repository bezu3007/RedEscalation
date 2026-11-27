export interface DiscussionParticipantPayload {
  employeeId?: string;
  name?: string;
  phoneNumber?: string;
  telegramId?: string;
}

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

  functionalConsultant: DiscussionParticipantPayload;

  developer: DiscussionParticipantPayload & {
    employeeId: string;
  };

  reviewer?: DiscussionParticipantPayload;

  requestedBy?: DiscussionParticipantPayload & {
    role?: string;
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
  role: "DEVELOPER" | "FC" | "REVIEWER" | "REQUESTER";
  telegramId?: string;
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
  topicUrl?: string;
  botUrl?: string;
  message: string;
  participants?: ParticipantSyncResult[];
}

export interface UpdateDiscussionRequest {
  caseId: string | number;
  caseNumber?: string;
  previousStatus?: string;
  currentStatus?: string;
  updatedBy?: string;
  note?: string;
  deadLine?: string;
}

export interface UpdateDiscussionResponse {
  success: boolean;
  found: boolean;
  reopened?: boolean;
  caseId: string;
  caseNumber?: string;
  groupId?: string;
  messageThreadId?: number;
  status?: "OPEN" | "CLOSED";
  topicUrl?: string;
  message: string;
}

export interface CloseDiscussionRequest {
  caseId: string | number;
  caseNumber?: string;
  finalStatus?: string;
  closedBy?: string;
  note?: string;
}

export interface CloseDiscussionResponse {
  success: boolean;
  found: boolean;
  alreadyClosed?: boolean;
  caseId: string;
  caseNumber?: string;
  groupId?: string;
  messageThreadId?: number;
  status?: "OPEN" | "CLOSED";
  closedAt?: string | null;
  message: string;
}