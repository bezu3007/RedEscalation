import { User, UserRole } from "../types";

export function determineUserRole(user: User | null): UserRole {
  if (!user) return UserRole.FUNCTIONAL_CONSULTANT;

  const departmentId = user.department || 0;
  const userId = user.id || 0;
  const userRole = user.role || 0;
  // ADMIN: Department 56 AND User ID 37453
  if (departmentId === 56 && userId === 37453) {
    return UserRole.ADMIN;
  }

  // DEVELOPER: Department 56 (and not admin)
  if (departmentId === 56) {
    return UserRole.DEVELOPER;
  }

  // if (userId === 231){
  //   return UserRole.PROJECT_MANAGER;
  // }
  if (userRole === 127) {
    return UserRole.PROJECT_MANAGER;
  }
  
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