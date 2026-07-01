import { User, UserRole } from "../types";

/**
 * Determine user role based on department and user ID
 * This matches your C# logic:
 * - Admin: department 56 AND user id 37453
 * - Developer: department 56 (and not admin)
 * - Functional Consultant: department != 56 (default)
 * - Project Manager: Not explicitly stored, derived from case assignments
 */
export function determineUserRole(user: User | null): UserRole {
  if (!user) return UserRole.FUNCTIONAL_CONSULTANT;

  const departmentId = user.department || 0;
  const userId = user.id || 0;

  // ADMIN: Department 56 AND User ID 37453
  if (departmentId === 56 && userId === 37453) {
    return UserRole.ADMIN;
  }

  // DEVELOPER: Department 56 (and not admin)
  if (departmentId === 56) {
    return UserRole.DEVELOPER;
  }

  // For FC and PM, we need to determine based on context
  // By default, if not admin or developer, they are FC
  // PM status is determined by being assigned as Consignee1 in cases
  // This will be checked at the API level when filtering cases
  
  // Default to FUNCTIONAL_CONSULTANT
  return UserRole.FUNCTIONAL_CONSULTANT;
}

/**
 * Get role name for display
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.DEVELOPER]: "Developer",
    [UserRole.FUNCTIONAL_CONSULTANT]: "Functional Consultant",
    [UserRole.PROJECT_MANAGER]: "Project Manager",
  };
  return roleMap[role] || "Unknown";
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return determineUserRole(user) === role;
}