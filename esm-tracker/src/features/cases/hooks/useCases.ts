import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import { useCaseStore } from "../store/caseStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { CaseItem } from "../types";
import { ROLE_VISIBLE_STATUSES } from "../utils/permissions";
import { getPlainTextFromHtml } from "../utils/htmlUtils";

export const CASES_KEY = "cases";

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

export function useCases() {
  const { filters } = useCaseStore();
  const user = useAuthStore.getState().user;
  const userRole = useAuthStore.getState().getUserRole();
  const visibleStatuses = userRole != null ? (ROLE_VISIBLE_STATUSES[userRole] ?? []) : [];

  const query = useQuery({
    queryKey: [CASES_KEY, userRole, user?.id, user?.department],
    queryFn: () => casesApi.getAll(),
    placeholderData: (prev) => prev,
  });

  const allItems = useMemo(() => {
    if (!query.data) return undefined;

    return query.data.items.filter((caseItem: CaseItem) => {
      if (!visibleStatuses.includes(caseItem.status)) return false;

      switch (userRole) {
        case UserRole.DEVELOPER:
          return String(caseItem.developerId) === String(user?.id);
        default:
          return true;
      }
    });
  }, [query.data, visibleStatuses, userRole, user?.id]);

  const data = useMemo(() => {
    if (!allItems) return undefined;

    const selectedValues = (value: string) =>
      value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    const includesSelection = (value: string, selection: string) =>
      selectedValues(selection).some((item) => item === value.toLowerCase());
    const matchesAnySelection = (
      id: string,
      name: string | null,
      selection: string
    ) =>
      selectedValues(selection).some((selected) =>
        id.toLowerCase() === selected ||
        Boolean(name?.toLowerCase().includes(selected))
      );
    const fromDate = filters.fromIssueDate;
    const toDate = filters.toIssueDate;
    const search = filters.search.trim().toLowerCase();
    const code = filters.code.trim().toLowerCase();
    const filtered = allItems.filter((item) => {
      if (code && !item.caseNumber.toLowerCase().includes(code)) return false;
      if (search) {
        const searchableValues = [
          item.caseNumber,
          item.projectName,
          item.module,
          item.issues ? getPlainTextFromHtml(item.issues) : "",
          item.status,
          item.caseType,
          item.paidorNot,
          item.functionalConsultant,
          item.developer,
          item.reviewer,
          item.department,
          item.developmentStatus,
          item.releaseNote,
          item.issueDate,
          item.startDate,
          item.deadLine,
        ];
        if (!searchableValues.some((value) => value?.toLowerCase().includes(search))) {
          return false;
        }
      }
      if (filters.status && !includesSelection(item.status, filters.status)) return false;
      if (filters.caseType && item.caseType.toLowerCase() !== filters.caseType.toLowerCase()) return false;
      if (filters.module && item.module.toLowerCase() !== filters.module.toLowerCase()) return false;
      if (filters.projectName &&
        String(item.projectNameId) !== filters.projectName &&
        !item.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) return false;
      if (filters.paidorNot && !includesSelection(item.paidorNot, filters.paidorNot)) return false;
      if (filters.developer &&
        String(item.developerId) !== filters.developer &&
        !item.developer?.toLowerCase().includes(filters.developer.toLowerCase())) return false;
      if (filters.functionalConsultant &&
        !matchesAnySelection(
          String(item.functionalConsultantId ?? ""),
          item.functionalConsultant,
          filters.functionalConsultant
        )) return false;

      const issueDate = item.issueDate.slice(0, 10);
      if (fromDate && issueDate < fromDate) return false;
      if (toDate && issueDate > toDate) return false;
      return true;
    });

    const treeItems = buildCaseTree(filtered);
      return {
        items: treeItems,
        totalCount: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
  }, [allItems, filters]);

  return { ...query, data, allItems };
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