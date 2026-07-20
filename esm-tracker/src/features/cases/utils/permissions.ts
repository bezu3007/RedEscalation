import { UserRole } from "@/features/auth/types";
import { CaseStatus } from "../types";

// Define what statuses each role can see in the grid
export const ROLE_VISIBLE_STATUSES: Record<UserRole, CaseStatus[]> = {
  [UserRole.FUNCTIONAL_CONSULTANT]: ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "On Progress", "Fixed", "Solved", "Not Solved"],
  [UserRole.PROJECT_MANAGER]: ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "On Progress", "Fixed", "Solved", "Not Solved"],
  [UserRole.ADMIN]: ["Prepared", "Returned", "Rejected", "Reviewed", "Accepted", "On Progress", "Fixed", "Solved", "Not Solved"], // Admin ONLY sees from Reviewed upward
  [UserRole.DEVELOPER]: ["Accepted", "On Progress", "Fixed", "Solved", "Not Solved"],
};

// Define allowed transitions for each role and status
export const ROLE_TRANSITIONS: Record<UserRole, Partial<Record<CaseStatus, CaseStatus[]>>> = {
  [UserRole.FUNCTIONAL_CONSULTANT]: {
    "Fixed": ["Solved", "Not Solved"],
  },
  
  [UserRole.PROJECT_MANAGER]: {
    "Prepared": ["Reviewed", "Returned", "Rejected"],
  },
  
  [UserRole.ADMIN]: {
    "Reviewed": ["Accepted", "Returned", "Rejected"],
    "Not Solved": ["Accepted", "Returned", "Rejected"],
    "Accepted": ["Fixed"],
  },
  
  [UserRole.DEVELOPER]: {
    "Accepted": ["On Progress", "Fixed"],
    "On Progress": ["Fixed"],
  },
};

// Get allowed transitions for a specific role and status
export function getAllowedTransitions(
  status: CaseStatus,
  functionalConsultantId: Number | null,
  role: UserRole
): CaseStatus[] {

  if(role === UserRole.ADMIN && functionalConsultantId === 37453 && status === "Fixed"){
    console.log("Admin as FC: ", role, functionalConsultantId, status);
    role = UserRole.FUNCTIONAL_CONSULTANT;
  }

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
      return caseItem.departmentId === userId;

    case UserRole.ADMIN:
      return true;

    case UserRole.DEVELOPER:
      return caseItem.developerId === userId;

    default:
      return true;
  }
}