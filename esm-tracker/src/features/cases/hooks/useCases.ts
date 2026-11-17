import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi, type CasesQueryParams } from "../api/casesApi";
import { useCaseStore } from "../store/caseStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { CaseItem } from "../types";
import { ROLE_VISIBLE_STATUSES } from "../utils/permissions";

export const CASES_KEY = "cases";

function flattenCaseTree(items: CaseItem[]): CaseItem[] {
  const flattened: CaseItem[] = [];

  const visit = (item: CaseItem) => {
    flattened.push(item);
    (item.children ?? []).forEach(visit);
  };

  items.forEach(visit);
  return flattened;
}

function buildCaseTree(items: CaseItem[]): CaseItem[] {
  const childrenMap = new Map<number, CaseItem[]>();

  items.forEach((item) => {
    if (item.id != null && item.parentCaseId) {
      const bucket = childrenMap.get(item.parentCaseId) ?? [];
      bucket.push(item);
      childrenMap.set(item.parentCaseId, bucket);
    }
  });

  const buildNode = (item: CaseItem, path: string[] = []): CaseItem => {
    const childNodes = (childrenMap.get(item.id ?? 0) ?? []).map((child) => buildNode(child, [...path, item.caseNumber || String(item.id ?? "case")]));

    return {
      ...item,
      children: childNodes,
      treePath: [...path, item.caseNumber || String(item.id ?? "case")],
    };
  };

  return items.filter((item) => !item.parentCaseId).map((item) => buildNode(item));
}

function buildVisibleTree(items: CaseItem[]): CaseItem[] {
  const visibleIds = new Set(items.map((item) => item.id).filter((id): id is number => id != null));
  const childrenMap = new Map<number, CaseItem[]>();

  items.forEach((item) => {
    if (item.id != null && item.parentCaseId && visibleIds.has(item.parentCaseId)) {
      const bucket = childrenMap.get(item.parentCaseId) ?? [];
      bucket.push(item);
      childrenMap.set(item.parentCaseId, bucket);
    }
  });

  const buildNode = (item: CaseItem, path: string[] = []): CaseItem => {
    const childNodes = (childrenMap.get(item.id ?? 0) ?? []).map((child) => buildNode(child, [...path, item.caseNumber || String(item.id ?? "case")]));

    return {
      ...item,
      children: childNodes,
      treePath: [...path, item.caseNumber || String(item.id ?? "case")],
    };
  };

  return items.filter((item) => !item.parentCaseId || !visibleIds.has(item.parentCaseId)).map((item) => buildNode(item));
}

export function useCases(extraParams?: Partial<CasesQueryParams>) {

  const { filters, page, pageSize } = useCaseStore();
  const user = useAuthStore.getState().user;
  const userRole = useAuthStore.getState().getUserRole();
  const visibleStatuses = userRole != null ? (ROLE_VISIBLE_STATUSES[userRole] ?? []) : [];

  return useQuery({
    queryKey: [CASES_KEY, filters, page, pageSize, extraParams, userRole, user?.id, user?.department],
    queryFn: async () => {
      // Fetch all cases with basic filters
      const response = await casesApi.getAll({ 
        ...filters, 
        page: 1, // Fetch all for frontend filtering
        pageSize: 9999, // Or a large number
        ...extraParams 
      });
      
      const filteredItems = response.items.filter((caseItem: CaseItem) => {
        // 1. Check if status is visible for this role
        if (!visibleStatuses.includes(caseItem.status)) {
          return false;
        }

        // 2. Check role-specific visibility rules
        switch (userRole) {
          case UserRole.FUNCTIONAL_CONSULTANT: {
            const isAssignedToUser =
              String(caseItem.functionalConsultantId ?? "") === String(user?.id ?? "");
            const isInUserDepartment =
              user?.department != null &&
              String(caseItem.fcDepartmentId ?? "") === String(user.department);
            return isAssignedToUser || isInUserDepartment;
          }

          case UserRole.PROJECT_MANAGER:
            return true;

          case UserRole.ADMIN:
            return true;

          case UserRole.DEVELOPER:
            return caseItem.developerId === user?.id;

          default:
            return true;
        }
      });

      // Apply additional filters (search, etc.)
      let filtered = filteredItems;
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(item =>
          item.caseNumber?.toLowerCase().includes(search) ||
          item.projectName?.toLowerCase().includes(search) ||
          item.issues?.toLowerCase().includes(search)
        );
      }

      if (filters?.developer) {
        const developerFilter = filters.developer.trim().toLowerCase();
        filtered = filtered.filter((item) => {
          const developerId = String(item.developerId ?? "").toLowerCase();
          const developerName = (item.developer ?? "").toLowerCase();
          return developerId === developerFilter || developerName.includes(developerFilter);
        });
      }

      const treeItems = buildCaseTree(filtered);
      const flattenedItems = flattenCaseTree(treeItems);

      // Paginate on frontend
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = flattenedItems.slice(start, end);

      return {
        items: buildVisibleTree(pageItems),
        totalCount: flattenedItems.length,
        page,
        pageSize,
      };
    },
    placeholderData: (prev) => prev,
  });
}



export function useCase(id: number | null) {

  return useQuery({

    queryKey: [CASES_KEY, id],

    queryFn: () => casesApi.getById(id!),

    enabled: id !== null,

  });

}



// export function useCreateCase() {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (body: any) =>
//       casesApi.create(body),

//     onSuccess: () => {
//       qc.invalidateQueries({queryKey: [CASES_KEY],});
//     },
//   });
// }

export function useCreateCase() {
  const qc = useQueryClient();

  return useMutation<CaseItem, Error, any>({
    mutationFn: (body) => casesApi.create(body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASES_KEY] });
    },
  });
}



export function useUpdateCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: any ) =>
      casesApi.update(body),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [CASES_KEY],
      });
    },
  });
}

export const useActivityLog = (caseId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["activity-log", caseId],
    queryFn: () => casesApi.getActivityLog(caseId),
    enabled: enabled && !!caseId,
  });
};