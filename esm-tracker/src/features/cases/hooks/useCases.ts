import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi, type CasesQueryParams } from "../api/casesApi";
import { useCaseStore } from "../store/caseStore";
import type { VoucherBuffer } from "../types";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { CaseItem, CaseStatus } from "../types";
import { ROLE_VISIBLE_STATUSES } from "../utils/permissions";

export const CASES_KEY = "cases";

export function useCases(extraParams?: Partial<CasesQueryParams>) {

  const { filters, page, pageSize } = useCaseStore();
  const user = useAuthStore.getState().user;
  const userRole = useAuthStore.getState().getUserRole();
  const visibleStatuses = userRole != null ? (ROLE_VISIBLE_STATUSES[userRole] ?? []) : [];

  return useQuery({
    queryKey: [CASES_KEY, filters, page, pageSize, extraParams, userRole, user?.id],
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
          case UserRole.FUNCTIONAL_CONSULTANT:
            return caseItem.functionalConsultantId === user?.id;

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

      // Paginate on frontend
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        items: filtered.slice(start, end),
        totalCount: filtered.length,
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



export function useCreateCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: any) =>
      casesApi.create(body),

    onSuccess: () => {
      qc.invalidateQueries({queryKey: [CASES_KEY],});
    },
  });
}



export function useUpdateCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({body }: { id: number; body: VoucherBuffer }) =>
      casesApi.update(body),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [CASES_KEY],
      });
    },
  });
}