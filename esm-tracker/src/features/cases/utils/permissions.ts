import { UserRole } from "@/features/auth/types";
import { CaseStatus } from "../types";

// Define what statuses each role can see in the grid
export const ROLE_VISIBLE_STATUSES: Record<UserRole, CaseStatus[]> = {
  [UserRole.FUNCTIONAL_CONSULTANT]: ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "OnProgress", "Solved", "NotSolved"],
  [UserRole.PROJECT_MANAGER]: ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "OnProgress", "Solved", "NotSolved"],
  [UserRole.ADMIN]: ["Prepared","Reviewed", "Accepted", "OnProgress", "Solved", "NotSolved"], // Admin ONLY sees from Reviewed upward
  [UserRole.DEVELOPER]: ["Accepted", "OnProgress", "Solved", "NotSolved"], // Developer ONLY sees Accepted and above
};

// Define allowed transitions for each role and status
export const ROLE_TRANSITIONS: Record<UserRole, Partial<Record<CaseStatus, CaseStatus[]>>> = {
  [UserRole.FUNCTIONAL_CONSULTANT]: {
    // FC has NO actions at all
  },
  
  [UserRole.PROJECT_MANAGER]: {
    "Prepared": ["Reviewed", "Returned", "Rejected"],
  },
  
  [UserRole.ADMIN]: {
    "Reviewed": ["Accepted", "Returned", "Rejected"],
    "NotSolved": ["Returned"], // Not solved goes back to admin
  },
  
  [UserRole.DEVELOPER]: {
    "Accepted": ["OnProgress"],
    "OnProgress": ["Solved", "NotSolved"],
  },
};

// Get allowed transitions for a specific role and status
export function getAllowedTransitions(
  status: CaseStatus,
  role: UserRole
): CaseStatus[] {
  const roleTransitions = ROLE_TRANSITIONS[role];
  if (!roleTransitions) return [];
  
  return roleTransitions[status] || [];
}

// Check if a user can view a case
export function canViewCase(
  caseItem: any,
  userId: number,
  role: UserRole
): boolean {
  if (!caseItem) return false;

  const visibleStatuses = ROLE_VISIBLE_STATUSES[role] || [];
  if (!visibleStatuses.includes(caseItem.status)) {
    return false;
  }

  switch (role) {
    case UserRole.FUNCTIONAL_CONSULTANT:
      return caseItem.functionalConsultantId === userId;

    case UserRole.PROJECT_MANAGER:
      return caseItem.departmentId === userId; // Assuming PM has departmentId

    case UserRole.ADMIN:
      return true;

    case UserRole.DEVELOPER:
      return caseItem.developerId === userId;

    default:
      return true;
  }
}