import { useCallback, useEffect, useState, useMemo } from "react";
import {useCaseStore,type ColumnKey} from "../store/caseStore";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {Plus,X,Search,Filter,Columns3} from "lucide-react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/shared/components/ui/select";
import {DropdownMenu,DropdownMenuContent,DropdownMenuCheckboxItem,DropdownMenuTrigger} from "@/shared/components/ui/dropdown-menu";
import { DateField } from "@/shared/components/DateField";
import {PAID_OR_NOT, type CaseFilters, type CaseStatus,type CaseType, type Consignee, type Extension} from "../types";
import {useAuthStore} from "../../auth/store/authStore";

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
  "Closed"
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
  | "code"
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

const emptyDraftFilters: CaseFilters = {
  code: "",
  search: "",
  status: "",
  caseType: "",
  module: "",
  projectName: "",
  paidorNot: "",
  developer: "",
  fromIssueDate: "",
  toIssueDate: "",
};

const COLUMN_CONFIG: {
  key: ColumnKey;
  label: string;
}[] = [
  { key: "issueDate", label: "Created" },
  { key: "paidorNot", label: "Payment Status" },
  { key: "caseType", label: "Case Type" },
  { key: "functionalConsultant", label: "Functional Consultant" },
  { key: "reviewedBy", label: "Reviewed By" },
  { key: "developer", label: "Developer" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "releaseNote", label: "Release Note" },
  { key: "startDate", label: "Start Date" },
  { key: "deadLine", label: "Deadline" },
];

interface Props {
  initData?: {
    projects?: Consignee[];
    developers?: Consignee[];
    modules?: Extension;
  };
}

export function FilterBar({ initData }: Props) {
  // const { data } = useCases();
  const userRole = useAuthStore.getState().userRole;
  const isDeveloper = userRole === "developer";
  
  // Memoize derived data to prevent recalculation on every render
  const [projectQuery, setProjectQuery] = useState("");
  const [moduleQuery, setModuleQuery] = useState("");
  // const [developerQuery, setDeveloperQuery] = useState("");

  const projectOptions = useMemo(() => {
    const projects = initData?.projects ?? [];
    const query = projectQuery.trim().toLowerCase();

    if (!query) {
      return projects.slice(0, 250);
    }

    return projects
      .filter((project) => {
        const haystack = [
          project.fullName,
          project.firstName,
          project.secondName,
          project.thirdName,
          project.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 250);
  }, [initData?.projects, projectQuery]);

  const moduleList = useMemo(() => {
  if (!initData?.modules?.remark) return [];
  const modules = initData.modules.remark
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  return [...new Set(modules)];
}, [initData?.modules]);

const filteredModuleOptions = useMemo(() => {
  const query = moduleQuery.trim().toLowerCase();
  
  if (!query) {
    return moduleList.slice(0, 250);
  }
  
  return moduleList
    .filter((module) => module.toLowerCase().includes(query))
    .slice(0, 250);
}, [moduleList, moduleQuery]);

  // Memoize developer options
  // const developerOptions = useMemo(() => {
  //   const developers = initData?.developers ?? [];
  //   const query = developerQuery.trim().toLowerCase();

  //   if (!query) {
  //     return developers.slice(0, 250);
  //   }

  //   return developers
  //     .filter((developer) => {
  //       const haystack = [
  //         developer.fullName,
  //         developer.firstName,
  //         developer.secondName,
  //         developer.thirdName,
  //         developer.code,
  //       ]
  //         .filter(Boolean)
  //         .join(" ")
  //         .toLowerCase();

  //       return haystack.includes(query);
  //     })
  //     .slice(0, 250);
  // }, [initData?.developers, developerQuery]);

  const paymentOptions = useMemo(() => {
    return [...PAID_OR_NOT];
  }, []);

  const {
    filters,
    setFilters,
    resetFilters,
    openCreateModal,
    visibleColumns,
    setVisibleColumns,
  } = useCaseStore();

  const [draftFilters, setDraftFilters] = useState<CaseFilters>(emptyDraftFilters);

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

  const hasActiveFilters = Object.entries(filters).some(([, value]) => Boolean(value));

  const handleShow = useCallback(() => {
    setFilters(draftFilters);
  }, [draftFilters, setFilters]);

  const handleClear = useCallback(() => {
    resetFilters();
    setDraftFilters(emptyDraftFilters);
  }, [resetFilters]);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
      {/* TOP */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {visibleFilters.code && (
          <Select
            value={draftFilters.code || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, code: v === "all" ? "" : (v as CaseType) })
            }
          >
            <SelectTrigger className="w-[170px] bg-gray-50">
              <SelectValue placeholder="Select Case Type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="all">All Types</SelectItem>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* <div className="relative flex-1 min-w-[220px] max-w-5">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search with case number..."
              className="pl-8 h-8 text-sm bg-gray-50"
              value={draftFilters.code}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, code: e.target.value })
              }
            />
          </div> */}
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

          {/* filter Menu */}          
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

          {/* Column menu */}
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

          {/* Add Issue Button */}
          {!isDeveloper && (
            <Button onClick={openCreateModal} className="gap-2 shrink-0 ">
            {/* <Button onClick={openCreateModal} className="gap-2 shrink-0 bg-emerald-100 text-emerald-800 border-emerald-200"> */}
              <Plus className="h-4 w-4" />
              Add Issue
            </Button>
          )}
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
              <SelectValue placeholder="Select Status" />
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
              <SelectValue placeholder="Select Case Type" />
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
              <div className="px-2 pb-1 text-sm text-slate-500">
                Select Module
              </div>
            </SelectTrigger>
            <SelectContent 
              className="bg-white z-[100] max-h-[320px] overflow-hidden"
              position="popper"
              sideOffset={4}
            >
              <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                <Input
                  value={moduleQuery}
                  onChange={(e) => setModuleQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Search module"
                  className="h-8"
                />
              </div>
              <div className="px-2 pb-1 text-xs text-slate-500">
                Showing first 250 matches. Type to narrow the list.
              </div>
              <div className="h-[220px] overflow-y-auto">
                {filteredModuleOptions.map((module: string) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </div>
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
              <div className="px-2 pb-1 text-sm text-slate-500">
                Select a project
              </div>
            </SelectTrigger>
            <SelectContent 
              className="bg-white z-[100] max-h-[320px] overflow-hidden"
              position="popper"
              sideOffset={4} 
            >
              <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                <Input
                  value={projectQuery}
                  onChange={(e) => setProjectQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Search project"
                  className="h-8"
                />
              </div>
              <div className="px-2 pb-1 text-xs text-slate-500">
                Showing first 250 matches. Type to narrow the list.
              </div>
              <div className="h-[220px] overflow-y-auto">
                {projectOptions.map((project: Consignee) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.fullName}
                  </SelectItem>
                ))}
              </div>
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
              className="w-[160px] bg-gray-50 text-sm text-slate-500"
            />
            <DateField
              placeholder="To Date"
              value={draftFilters.toIssueDate}
              onChange={(value) =>
                setDraftFilters({ ...draftFilters, toIssueDate: value })
              }
              className="w-[160px] bg-gray-50 text-sm text-slate-500"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="danger-outline"
              size="sm"
              onClick={handleClear}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}

          <Button size="sm" onClick={handleShow}>
            Show
          </Button>

        </div>
      </div>
    </div>
  );
}