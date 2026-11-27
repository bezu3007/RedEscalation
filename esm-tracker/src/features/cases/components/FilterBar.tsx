import { useCallback, useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useCaseStore, type ColumnKey } from "../store/caseStore";
import { UserRole } from "@/features/auth/types";
import { useCases } from "../hooks/useCases";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {Plus,X,Search,Filter,Columns3, } from "lucide-react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/shared/components/ui/select";
import {DropdownMenu,DropdownMenuContent,DropdownMenuCheckboxItem,DropdownMenuTrigger} from "@/shared/components/ui/dropdown-menu";
import { DateRangePicker } from "@/shared/components/DateRangePicker";
import type { CaseStatus, CaseType } from "../types";
import {useAuthStore} from "../../auth/store/authStore";

interface FilterOption {
  value: string;
  label: string;
}

type FilterKey =
  | "status"
  | "caseType"
  | "module"
  | "projectName"
  | "developer"
  | "functionalConsultant"
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
  { key: "developer", label: "Developer" },
  { key: "functionalConsultant", label: "Functional Consultant" },
  { key: "fromIssueDate", label: "From Date" },
  { key: "toIssueDate", label: "To Date" },
];

const getSelectedValues = (value: string) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

const toggleSelectedValue = (currentValue: string, value: string, checked: boolean) => {
  const selectedValues = getSelectedValues(currentValue).filter((item) => item !== value);
  if (checked) selectedValues.push(value);
  return selectedValues.join(",");
};

const getSelectedOptionLabel = (
  value: string,
  options: Array<string | FilterOption>,
  fallback: string
) => {
  const values = getSelectedValues(value);
  if (values.length === 0 || value === "all") return fallback;

  return values.map((selectedValue) => {
    const option = options.find((item) =>
      typeof item === "string" ? item === selectedValue : item.value === selectedValue
    );
    return typeof option === "string" ? option : option?.label ?? selectedValue;
  }).join(", ");
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

export function FilterBar() {
  const { allItems } = useCases();
  const cases = allItems ?? [];
  const userRole = useAuthStore.getState().userRole;
  const isDeveloper = userRole === UserRole.DEVELOPER;

  // Memoize derived data to prevent recalculation on every render
  const [projectQuery, setProjectQuery] = useState("");
  const [moduleQuery, setModuleQuery] = useState("");
  const [developerQuery, setDeveloperQuery] = useState("");
  const [functionalConsultantQuery, setFunctionalConsultantQuery] = useState("");

  const statusOptions = useMemo<CaseStatus[]>(
    () => [...new Set(cases.map((item) => item.status))].sort(),
    [allItems]
  );

  const typeOptions = useMemo<CaseType[]>(
    () => [...new Set(cases.map((item) => item.caseType))].sort(),
    [allItems]
  );

  const projectOptions = useMemo<FilterOption[]>(() => {
    const projects = new Map<string, FilterOption>();
    cases.forEach((item) => {
      const label = item.projectName.trim();
      const value = String(item.projectNameId || label);
      if (label && !projects.has(value)) projects.set(value, { value, label });
    });
    const query = projectQuery.trim().toLowerCase();

    return [...projects.values()]
      .filter((project) => project.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allItems, projectQuery]);

  const moduleList = useMemo(() => {
    return [...new Set(cases.map((item) => item.module.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [allItems]);

const filteredModuleOptions = useMemo(() => {
  const query = moduleQuery.trim().toLowerCase();
  
  if (!query) {
    return moduleList;
  }
  
  return moduleList.filter((module) => module.toLowerCase().includes(query));
}, [moduleList, moduleQuery]);

  const developerOptions = useMemo<FilterOption[]>(() => {
    const developers = new Map<string, FilterOption>();
    cases.forEach((item) => {
      const label = item.developer?.trim();
      const value = String(item.developerId || label || "");
      if (label && !developers.has(value)) developers.set(value, { value, label });
    });
    const query = developerQuery.trim().toLowerCase();

    return [...developers.values()]
      .filter((developer) => developer.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allItems, developerQuery]);

  const functionalConsultantOptions = useMemo<FilterOption[]>(() => {
    const consultants = new Map<string, FilterOption>();
    cases.forEach((item) => {
      const label = item.functionalConsultant.trim();
      const value = String(item.functionalConsultantId || label);
      if (label && !consultants.has(value)) consultants.set(value, { value, label });
    });
    const query = functionalConsultantQuery.trim().toLowerCase();

    return [...consultants.values()]
      .filter((consultant) => consultant.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allItems, functionalConsultantQuery]);

  const {
    filters,
    setFilters,
    resetFilters,
    openCreateModal,
    visibleColumns,
    setVisibleColumns,
  } = useCaseStore();

  const draftFilters = filters;
  const setDraftFilters = setFilters;

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

  const selectedIssueDateRange = useMemo<DateRange | undefined>(() => {
    if (!draftFilters.fromIssueDate && !draftFilters.toIssueDate) return undefined;

    const parseDate = (value: string) => {
      if (!value) return undefined;
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    return {
      from: parseDate(draftFilters.fromIssueDate),
      to: parseDate(draftFilters.toIssueDate),
    };
  }, [draftFilters.fromIssueDate, draftFilters.toIssueDate]);

  const handleIssueDateRangeChange = useCallback((range: DateRange | undefined) => {
    setFilters({
      fromIssueDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      toIssueDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    });
  }, [setFilters]);

  const handleClear = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
      {/* TOP */}
      <div className="flex flex-wrap items-center justify-between gap-2">
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
              {FILTER_CONFIG
                .filter(
                  (filter) =>
                    !(isDeveloper && filter.key === "developer")
                )
                .map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.key}
                    checked={visibleFilters[filter.key]}
                    onCheckedChange={(checked) =>
                      setVisibleFilters((prev) => ({
                        ...prev,
                        [filter.key]: !!checked,
                      }))
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{ backgroundColor: "#f9fafb" }}
                className="w-[170px] justify-start bg-gray-50 font-normal"
              >
                <span className="truncate">
                  {getSelectedOptionLabel(draftFilters.status, statusOptions, "Select Status")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] max-h-[320px] overflow-y-auto">
              <DropdownMenuCheckboxItem
                checked={getSelectedValues(draftFilters.status).length === 0}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => setDraftFilters({ ...draftFilters, status: "" })}
              >
                All Statuses
              </DropdownMenuCheckboxItem>
              {statusOptions.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={getSelectedValues(draftFilters.status).includes(s)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    setDraftFilters({
                      ...draftFilters,
                      status: toggleSelectedValue(draftFilters.status, s, checked === true),
                    })
                  }
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              {typeOptions.map((t) => (
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
              <span className="truncate text-left">
                {getSelectedOptionLabel(draftFilters.module, moduleList, "Select Module")}
              </span>
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
              <SelectItem value="all">All Modules</SelectItem>
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
              <span className="truncate text-left">
                {getSelectedOptionLabel(draftFilters.projectName, projectOptions, "Select a project")}
              </span>
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
              <SelectItem value="all">All Projects</SelectItem>
              <div className="h-[220px] overflow-y-auto">
                {projectOptions.map((project) => (
                  <SelectItem key={project.value} value={project.value}>
                    {project.label}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        )}

        {visibleFilters.developer && !isDeveloper && (
          <Select
            value={draftFilters.developer || "all"}
            onValueChange={(v) =>
              setDraftFilters({ ...draftFilters, developer: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <span className="truncate text-left">
                {getSelectedOptionLabel(draftFilters.developer, developerOptions, "Select a developer")}
              </span>
            </SelectTrigger>
            <SelectContent 
              className="bg-white z-[100] max-h-[320px] overflow-hidden"
              position="popper"
              sideOffset={4} 
            >
              <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                <Input
                  value={developerQuery}
                  onChange={(e) => setDeveloperQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Search developer"
                  className="h-8"
                />
              </div>
              <SelectItem value="all">All Developers</SelectItem>
              <div className="h-[220px] overflow-y-auto">
                {developerOptions.map((developer) => (
                  <SelectItem key={developer.value} value={developer.value}>
                    {developer.label}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        )}

        {visibleFilters.functionalConsultant && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{ backgroundColor: "#f9fafb" }}
                className="w-[180px] justify-start bg-gray-50 font-normal"
              >
                <span className="truncate text-left">
                  {getSelectedOptionLabel(draftFilters.functionalConsultant, functionalConsultantOptions, "Select a functional consultant")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px] max-h-[320px] overflow-hidden">
                <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                  <Input
                    value={functionalConsultantQuery}
                    onChange={(e) => setFunctionalConsultantQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search functional consultant"
                    className="h-8"
                  />
                </div>
                <DropdownMenuCheckboxItem
                  checked={getSelectedValues(draftFilters.functionalConsultant).length === 0}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => setDraftFilters({ ...draftFilters, functionalConsultant: "" })}
                >
                  All Functional Consultants
                </DropdownMenuCheckboxItem>
                <div className="h-[220px] overflow-y-auto">
                  {functionalConsultantOptions.map((functionalConsultant) => (
                    <DropdownMenuCheckboxItem
                      key={functionalConsultant.value}
                      checked={getSelectedValues(draftFilters.functionalConsultant).includes(functionalConsultant.value)}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) =>
                        setDraftFilters({
                          ...draftFilters,
                          functionalConsultant: toggleSelectedValue(
                            draftFilters.functionalConsultant,
                            functionalConsultant.value,
                            checked === true
                          ),
                        })
                      }
                    >
                      {functionalConsultant.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

        {(visibleFilters.fromIssueDate || visibleFilters.toIssueDate) && (
          <DateRangePicker
            date={selectedIssueDateRange}
            onDateChange={handleIssueDateRangeChange}
          />
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="danger-outline"
            size="sm"
            onClick={handleClear}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>

        </div>
      </div>
    </div>
  );
}