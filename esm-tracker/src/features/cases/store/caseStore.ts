import { create } from "zustand";
import type { CaseFilters, CaseItem } from "../types";

const today =new Date().toISOString().split("T")[0];

const defaultFilters: CaseFilters = {
  search: "",
  status: "",
  caseType: "",
  module: "",
  projectName: "",
  paidorNot: "",
  developer: "",
  fromIssueDate: today,
  toIssueDate: today,
};

export type ColumnKey =
  | "caseNumber"
  | "issueDate"
  | "projectName"
  | "issues"
  | "paidorNot"
  | "caseType"
  | "module"
  | "functionalConsultant"
  | "reviewedBy"
  | "developer"
  | "department"
  | "developmentStatus"
  | "status"
  | "releaseNote"
  | "startDate"
  | "deadLine";


interface CaseUIState {
  filters: CaseFilters;
  selectedCaseId: number | null;
  selectedParentCase: CaseItem | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isViewModalOpen: boolean;
  editingCase: CaseItem | null;
  viewingCase: CaseItem | null;
  page: number;
  pageSize: number;
  visibleColumns: Record<ColumnKey, boolean>;
  setVisibleColumns: (columns: Record<ColumnKey, boolean>) => void;
  setFilters: (filters: Partial<CaseFilters>) => void;
  resetFilters: () => void;
  setSelectedCaseId: (id: number | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (caseItem: CaseItem) => void;
  closeEditModal: () => void;
  openViewModal: (caseItem: CaseItem) => void;
  closeViewModal: () => void;
  setSelectedParentCase: (data: CaseItem | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  statusPopup: {
    isOpen: boolean;
    caseItem: CaseItem | null;
    anchorEl: HTMLElement | null;
  };
  
  openStatusPopup: (caseItem: CaseItem, anchorEl: HTMLElement) => void;
  closeStatusPopup: () => void;
}

export const useCaseStore = create<CaseUIState>((set) => ({
  filters: defaultFilters,
  selectedCaseId: null,
  selectedParentCase: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isViewModalOpen: false,
  editingCase: null,
  viewingCase: null,
  page: 1,
  pageSize: 25,
  visibleColumns: {
    caseNumber: true,
    issueDate: true,
    projectName: true,
    issues: false,
    paidorNot: false,
    caseType: true,
    module: true,
    functionalConsultant: true,
    reviewedBy: false,
    developer: true,
    department: false,
    developmentStatus: false,
    status: true,
    releaseNote: false,
    startDate: false,
    deadLine: true,
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

  // CREATE
  openCreateModal: () =>
    set({ isCreateModalOpen: true }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      selectedParentCase: null,
    }),

  // EDIT
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

  // VIEW
  openViewModal: (caseItem) =>
    set({
      isViewModalOpen: true,
      viewingCase: caseItem,
    }),

  closeViewModal: () =>
    set({
      isViewModalOpen: false,
      viewingCase: null,
    }),

  // SUB CASE CONTEXT
  setSelectedParentCase: (data) =>
    set({ selectedParentCase: data }),

  // PAGINATION
  setPage: (page) => set({ page }),

  setPageSize: (size) =>
    set({
      pageSize: size,
      page: 1,
    }),
    
  statusPopup: {
    isOpen: false,
    caseItem: null,
    anchorEl: null,
  },
  openStatusPopup: (caseItem, anchorEl) =>
    set({
      statusPopup: {
        isOpen: true,
        caseItem,
        anchorEl,
      },
    }),
    
  closeStatusPopup: () =>
    set({
      statusPopup: {
        isOpen: false,
        caseItem: null,
        anchorEl: null,
      },
    }),
}));

