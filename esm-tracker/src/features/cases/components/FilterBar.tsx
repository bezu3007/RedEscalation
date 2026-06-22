import { useCallback, useEffect, useState } from "react";

import {
  useCaseStore,
  type ColumnKey,
} from "../store/caseStore";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

import {
  Plus,
  X,
  Search,
  Filter,
  Columns3,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { DateField } from "@/shared/components/DateField";

import type {
  CaseStatus,
  CaseType,
  CasePriority,
} from "../types";

const STATUSES: CaseStatus[] = [
  "Open",
  "InProgress",
  "PendingApproval",
  "Resolved",
  "Closed",
  "Rejected",
];

const TYPES: CaseType[] = [
  "Bug",
  "FeatureRequest",
  "Support",
  "Payment",
  "Infrastructure",
  "Other",
];

const PRIORITIES: CasePriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

type FilterKey =
  | "status"
  | "caseType"
  | "priority"
  | "fromDate"
  | "toDate";

const FILTER_CONFIG: {
  key: FilterKey;
  label: string;
}[] = [
  { key: "status", label: "Status" },
  { key: "caseType", label: "Type" },
  { key: "priority", label: "Priority" },
  { key: "fromDate", label: "From Date" },
  { key: "toDate", label: "To Date" },
];

const COLUMN_CONFIG: {
  key: ColumnKey;
  label: string;
}[] = [
  { key: "caseNumber", label: "Case #" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "caseType", label: "Type" },
  { key: "priority", label: "Priority" },
  { key: "projectName", label: "Project" },
  { key: "department", label: "Department" },
  { key: "assignedDeveloper", label: "Developer" },
  { key: "createdAt", label: "Created Date" },
];

export function FilterBar() {
  const {
    filters,
    setFilters,
    resetFilters,
    openCreateModal,
    visibleColumns,
    setVisibleColumns,
  } = useCaseStore();

  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const [visibleFilters, setVisibleFilters] =
    useState<Record<FilterKey, boolean>>(
      () =>
        Object.fromEntries(
          FILTER_CONFIG.map((f) => [f.key, true])
        ) as Record<FilterKey, boolean>
    );

  useEffect(() => {
    const saved =
      localStorage.getItem("visibleFilters");

    if (saved) {
      setVisibleFilters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "visibleFilters",
      JSON.stringify(visibleFilters)
    );
  }, [visibleFilters]);

  useEffect(() => {
    const saved =
      localStorage.getItem("visibleColumns");

    if (saved) {
      setVisibleColumns(JSON.parse(saved));
    }
  }, [setVisibleColumns]);

  useEffect(() => {
    localStorage.setItem(
      "visibleColumns",
      JSON.stringify(visibleColumns)
    );
  }, [visibleColumns]);

  const handleSearch = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setFilters({
        search: e.target.value,
      });
    },
    [setFilters]
  );

  const hasActiveFilters =
    Object.values(filters).some(Boolean);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
      {/* TOP ROW */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />

            <Input
              placeholder="Search cases..."
              className="pl-8 h-8 text-sm bg-gray-50"
              // value={filters.search}
              // onChange={handleSearch}
              value={draftFilters.search}
                onChange={(e) =>
                  setDraftFilters({
                    ...draftFilters,
                    search: e.target.value,
                  })
                }
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* FILTERS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 z-50"
            >
              {FILTER_CONFIG.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.key}
                  checked={
                    visibleFilters[filter.key]
                  }
                  onCheckedChange={(
                    checked
                  ) =>
                    setVisibleFilters((prev) => ({
                      ...prev,
                      [filter.key]:
                        !!checked,
                    }))
                  }
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* COLUMNS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Columns3 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 z-50"
            >
              {COLUMN_CONFIG.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={
                    visibleColumns[column.key]
                  }
                  onCheckedChange={(
                    checked
                  ) => {
                    const visibleCount =
                      Object.values(
                        visibleColumns
                      ).filter(Boolean).length;

                    if (
                      !checked &&
                      visibleCount === 1
                    ) {
                      return;
                    }

                    setVisibleColumns({
                      ...visibleColumns,
                      [column.key]:
                        !!checked,
                    });
                  }}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* NEW */}
          <Button
            onClick={openCreateModal}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="flex flex-wrap gap-2 items-center">
        {visibleFilters.status && (
          <Select
            // value={filters.status || "all"}
            value={draftFilters.status || "all"}
            onValueChange={(v) =>
              // setFilters({
              //   status:
              //     v === "all"
              //       ? ""
              //       : (v as CaseStatus),
              // })

              setDraftFilters({
                ...draftFilters,
                status:
                  v === "all"
                    ? ""
                    : (v as CaseStatus),
              })
            }
          >
            <SelectTrigger className="w-[150px] bg-gray-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Statuses
              </SelectItem>

              {STATUSES.map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                >
                  {s === "InProgress"
                    ? "In Progress"
                    : s ===
                      "PendingApproval"
                    ? "Pending Approval"
                    : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.caseType && (
          // <Select
          //   value={
          //     filters.caseType || "all"
          //   }
          //   onValueChange={(v) =>
          //     setFilters({
          //       caseType:
          //         v === "all"
          //           ? ""
          //           : (v as CaseType),
          //     })
          //   }
          // >
          <Select
            value={draftFilters.caseType || "all"}
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                caseType:
                  v === "all"
                    ? ""
                    : (v as CaseType),
              })
            }
          >
            <SelectTrigger className="w-[150px] bg-gray-50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Types
              </SelectItem>

              {TYPES.map((t) => (
                <SelectItem
                  key={t}
                  value={t}
                >
                  {t ===
                  "FeatureRequest"
                    ? "Feature Request"
                    : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.priority && (
          <Select
            value={
              draftFilters.priority || "all"
            }
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                priority:
                  v === "all"
                    ? ""
                    : (v as CasePriority),
              })
            }
          >
            <SelectTrigger className="w-[140px] bg-gray-50">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Priorities
              </SelectItem>

              {PRIORITIES.map((p) => (
                <SelectItem
                  key={p}
                  value={p}
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.fromDate && (
          <DateField
            placeholder="From date"
            value={draftFilters.dateFrom}
            onChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                dateFrom: v,
              })
            }
            className="w-[140px] bg-gray-50"
          />
        )}

        {visibleFilters.toDate && (
          <DateField
            placeholder="To date"
            value={draftFilters.dateTo}
            onChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                dateTo: v,
              })
            }
            className="w-[140px] bg-gray-50"
          />
        )}
        
        <Button
          size="sm"
          onClick={() => setFilters(draftFilters)}
          className="gap-2 ml-auto"
        >
          Show
        </Button>
          {/* CLEAR */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              // onClick={resetFilters}
              onClick={() => {
                resetFilters();

                setDraftFilters({
                  search: "",
                  status: "",
                  caseType: "",
                  priority: "",
                  dateFrom: "",
                  dateTo: "",
                  department: "",
                  projectName: "",
                  assignedDeveloper: "",
                });
              }}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
      </div>
    </div>
  );
}