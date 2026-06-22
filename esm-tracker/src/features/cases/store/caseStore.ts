import { create } from "zustand";

import type { CaseFilters, CaseItem } from "../types";

const defaultFilters: CaseFilters = {
  search: "",
  status: "",
  caseType: "",
  priority: "",
  department: "",
  projectName: "",
  assignedDeveloper: "",
  dateFrom: "",
  dateTo: "",
};

export type ColumnKey =
  | "caseNumber"
  | "title"
  | "status"
  | "caseType"
  | "priority"
  | "projectName"
  | "department"
  | "assignedDeveloper"
  | "createdAt";

interface CaseUIState {
  filters: CaseFilters;

  selectedCaseId: number | null;

  isCreateModalOpen: boolean;

  isEditModalOpen: boolean;

  editingCase: CaseItem | null;

  page: number;

  pageSize: number;

  visibleColumns: Record<ColumnKey, boolean>;

  setVisibleColumns: (
    columns: Record<ColumnKey, boolean>
  ) => void;

  setFilters: (filters: Partial<CaseFilters>) => void;

  resetFilters: () => void;

  setSelectedCaseId: (id: number | null) => void;

  openCreateModal: () => void;

  closeCreateModal: () => void;

  openEditModal: (caseItem: CaseItem) => void;

  closeEditModal: () => void;

  setPage: (page: number) => void;

  setPageSize: (size: number) => void;
}

export const useCaseStore = create<CaseUIState>((set) => ({
  filters: defaultFilters,

  selectedCaseId: null,

  isCreateModalOpen: false,

  isEditModalOpen: false,

  editingCase: null,

  page: 1,

  pageSize: 25,

  visibleColumns: {
    caseNumber: true,
    title: true,
    status: true,
    caseType: true,
    priority: true,
    projectName: true,
    department: true,
    assignedDeveloper: true,
    createdAt: true,
  },

  setVisibleColumns: (visibleColumns) =>
    set({ visibleColumns }),

  setFilters: (filters) =>
    set((s) => ({
      filters: { ...s.filters, ...filters },
      page: 1,
    })),

  resetFilters: () =>
    set({
      filters: defaultFilters,
      page: 1,
    }),

  setSelectedCaseId: (id) =>
    set({ selectedCaseId: id }),

  openCreateModal: () =>
    set({ isCreateModalOpen: true }),

  closeCreateModal: () =>
    set({ isCreateModalOpen: false }),

  openEditModal: (caseItem) =>
    set({
      isEditModalOpen: true,
      editingCase: caseItem,
    }),

  closeEditModal: () =>
    set({
      isEditModalOpen: false,
      editingCase: null,
    }),

  setPage: (page) => set({ page }),

  setPageSize: (size) =>
    set({
      pageSize: size,
      page: 1,
    }),
}));
