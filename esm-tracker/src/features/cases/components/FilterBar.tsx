import { useCallback, useEffect, useState, useMemo } from "react";
import { useCases } from "../hooks/useCases";
import {useCaseStore,type ColumnKey} from "../store/caseStore";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {Plus,X,Search,Filter,Columns3} from "lucide-react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/shared/components/ui/select";
import {DropdownMenu,DropdownMenuContent,DropdownMenuCheckboxItem,DropdownMenuTrigger} from "@/shared/components/ui/dropdown-menu";
import { DateField } from "@/shared/components/DateField";
import type {CaseStatus,CaseType} from "../types";

const STATUSES: CaseStatus[] = [
  "Accepted",
  "Solved",
  "Fixed",
  "Prepared",
  "Re Journal",
  "Rejected",
  "Returned",
  "Reviewed",
  "Not Solved",
  "On Progress",
];

const TYPES: CaseType[] = [
  "Performance",
  "Error",
  "Report",
  "Intermitant Case",
  "New Functionality",
  "Customization",
  "Not Implemented",
];

type FilterKey =
  | "status"
  | "caseType"
  | "module"
  | "projectName"
  | "paidorNot"
  | "fromIssueDate"
  | "toIssueDate";

const FILTER_CONFIG: {
  key: FilterKey;
  label: string;
}[] = [
  { key: "status", label: "Status" },
  { key: "caseType", label: "Type" },
  { key: "module", label: "Module" },
  { key: "projectName", label: "Project" },
  { key: "paidorNot", label: "Payment Status" },
  { key: "fromIssueDate", label: "From Date" },
  { key: "toIssueDate", label: "To Date" },
];

const COLUMN_CONFIG: {
  key: ColumnKey;
  label: string;
}[] = [
  { key: "caseNumber", label: "Case #" },
  { key: "issueDate", label: "Created" },
  { key: "projectName", label: "Project" },
  { key: "issues", label: "Issue" },
  { key: "paidorNot", label: "Payment Status" },
  { key: "caseType", label: "Case Type" },
  { key: "module", label: "Module" },
  { key: "functionalConsultant", label: "Functional Consultant" },
  { key: "reviewedBy", label: "Reviewed By" },
  { key: "developer", label: "Developer" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "releaseNote", label: "Release Note" },
  { key: "startDate", label: "Start Date" },
  { key: "deadLine", label: "Deadline" },
];

export function FilterBar() {
  const { data } = useCases();
  
  // Memoize derived data to prevent recalculation on every render
  const { moduleOptions, paymentOptions, projectOptions } = useMemo(() => {
    const items = data?.items ?? [];
    
    return {
      moduleOptions: Array.from(
        new Set(items.map((x) => x.module).filter(Boolean))
      ).sort(),
      
      paymentOptions: Array.from(
        new Set(items.map((x) => x.paidorNot).filter(Boolean))
      ).sort(),
      
      projectOptions: Array.from(
        new Set(items.map((x) => x.projectName).filter(Boolean))
      ).sort(),
    };
  }, [data?.items]);

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

  const [visibleFilters, setVisibleFilters] = useState<Record<FilterKey, boolean>>(
    () => Object.fromEntries(FILTER_CONFIG.map((f) => [f.key, true])) as Record<FilterKey, boolean>
  );

  useEffect(() => {
    const saved = localStorage.getItem("visibleFilters");
    if (saved) {
      setVisibleFilters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("visibleFilters", JSON.stringify(visibleFilters));
  }, [visibleFilters]);

  //columns
  useEffect(() => {
    const saved = localStorage.getItem("visibleColumns");
    if (saved) {
      const parsed = JSON.parse(saved);
      setVisibleColumns({ ...visibleColumns, ...parsed });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleShow = useCallback(() => {
    if (!draftFilters.fromIssueDate || !draftFilters.toIssueDate) {
      alert("Date range is required");
      return;
    }
    setFilters(draftFilters);
  }, [draftFilters, setFilters]);

  const handleClear = useCallback(() => {
    resetFilters();
    setDraftFilters({
      search: "",
      status: "",
      caseType: "",
      module: "",
      projectName: "",
      paidorNot: "",
      fromIssueDate: "",
      toIssueDate: "",
      developer: "",
    });
  }, [resetFilters]);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
      {/* TOP */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-8 h-8 text-sm bg-gray-50"
              value={draftFilters.search}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, search: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50">
              {FILTER_CONFIG.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.key}
                  checked={visibleFilters[filter.key]}
                  onCheckedChange={(checked) =>
                    setVisibleFilters((prev) => ({ ...prev, [filter.key]: !!checked }))
                  }
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns3 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50">
              {COLUMN_CONFIG.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns[column.key]}
                  onCheckedChange={(checked) => {
                    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
                    if (!checked && visibleCount === 1) return;
                    setVisibleColumns({ ...visibleColumns, [column.key]: !!checked });
                  }}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={openCreateModal} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Issue
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 items-center">
        {visibleFilters.status && (
          <Select
            value={draftFilters.status || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, status: v === "all" ? "" : (v as CaseStatus) })
            }
          >
            <SelectTrigger className="w-[170px] bg-gray-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.caseType && (
          <Select
            value={draftFilters.caseType || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, caseType: v === "all" ? "" : (v as CaseType) })
            }
          >
            <SelectTrigger className="w-[170px] bg-gray-50">
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Types</SelectItem>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.module && (
          <Select
            value={draftFilters.module || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, module: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Modules</SelectItem>
              {moduleOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.projectName && (
          <Select
            value={draftFilters.projectName || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, projectName: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Projects" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Projects</SelectItem>
              {projectOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {visibleFilters.paidorNot && (
          <Select
            value={draftFilters.paidorNot || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, paidorNot: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Payments</SelectItem>
              {paymentOptions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(visibleFilters.fromIssueDate || visibleFilters.toIssueDate) && (
          <div className="flex items-center gap-2">
            <DateField
              placeholder="From Date"
              value={draftFilters.fromIssueDate}
              onChange={(value) =>
                setDraftFilters({ ...draftFilters, fromIssueDate: value })
              }
              className="w-[160px] bg-gray-50"
            />
            <DateField
              placeholder="To Date"
              value={draftFilters.toIssueDate}
              onChange={(value) =>
                setDraftFilters({ ...draftFilters, toIssueDate: value })
              }
              className="w-[160px] bg-gray-50"
            />
          </div>
        )}

        <Button size="sm" onClick={handleShow}>
          Show
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}