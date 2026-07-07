// features/cases/hooks/usePermissions.ts
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import type { CaseItem } from "../types";

export function usePermissions() {
  const { user, userRole } = useAuthStore();

  const canCreateCase = userRole === UserRole.FUNCTIONAL_CONSULTANT || 
                        userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;
  
  const canEditCase = (caseItem: CaseItem) => {
    if (!user) return false;
    
    // FC can only edit their prepared cases
    if (userRole === UserRole.FUNCTIONAL_CONSULTANT) {
      return caseItem.status === "Prepared" && 
             caseItem.functionalConsultantId === user.id;
    }
    
    // Admin can edit anything
    if (userRole === UserRole.ADMIN) return true;
    
    return false;
  };

  const canReviewCase = (caseItem: CaseItem) => {
    if (!user) return false;
    
    // PM can review prepared cases assigned to them
    if (userRole === UserRole.PROJECT_MANAGER) {
      return caseItem.status === "Prepared" && 
             caseItem.projectNameId === user.id.toString();
    }
    
    // Admin can review anything
    if (userRole === UserRole.ADMIN) return true;
    
    return false;
  };

  const canAcceptCase = (caseItem: CaseItem) => {
    if (!user) return false;
    
    // Admin can accept reviewed cases
    if (userRole === UserRole.ADMIN) {
      return caseItem.status === "Reviewed";
    }
    
    return false;
  };

  const canProgressCase = (caseItem: CaseItem) => {
    if (!user) return false;
    
    // Developer can progress accepted cases assigned to them
    if (userRole === UserRole.DEVELOPER) {
      return caseItem.status === "Accepted" && 
             caseItem.developerId === user.id.toString();
    }
    
    return false;
  };

  const canViewAllCases = userRole === UserRole.ADMIN || 
                          userRole === UserRole.PROJECT_MANAGER;
  
  const canViewCase = (caseItem: CaseItem) => {
    if (!user) return false;
    
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.PROJECT_MANAGER) return caseItem.projectNameId === user.id.toString();
    if (userRole === UserRole.DEVELOPER) return caseItem.developerId === user.id.toString();
    if (userRole === UserRole.FUNCTIONAL_CONSULTANT) return caseItem.functionalConsultantId === user.id;
    
    return false;
  };

  return {
    user,
    userRole,
    isAdmin: userRole === UserRole.ADMIN,
    isDeveloper: userRole === UserRole.DEVELOPER,
    isFunctionalConsultant: userRole === UserRole.FUNCTIONAL_CONSULTANT,
    isProjectManager: userRole === UserRole.PROJECT_MANAGER,
    canCreateCase,
    canEditCase,
    canReviewCase,
    canAcceptCase,
    canProgressCase,
    canViewAllCases,
    canViewCase,
  };
}