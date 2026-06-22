export type NotificationType =
  | "CaseAssigned"
  | "StatusChanged"
  | "CommentAdded"
  | "ApprovalRequired"
  | "Resolved";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId: number | null;
  caseNumber: string | null;
  isRead: boolean;
  createdAt: string;
}