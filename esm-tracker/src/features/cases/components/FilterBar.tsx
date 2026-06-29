import { useCallback, useEffect, useState } from "react";
import { useCases } from "../hooks/useCases";
import {useCaseStore,type ColumnKey,} from "../store/caseStore";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {Plus,X,Search,Filter,Columns3,} from "lucide-react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/shared/components/ui/select";
import {DropdownMenu,DropdownMenuContent,DropdownMenuCheckboxItem,DropdownMenuTrigger,} from "@/shared/components/ui/dropdown-menu";
import { DateField } from "@/shared/components/DateField";
import type {CaseStatus,CaseType,} from "../types";


export function FilterBar() {

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
  | "CaseType"
  | "Module"
  | "projectName"
  | "PaidorNot"
  | "fromIssueDate"
  | "toIssueDate";

const FILTER_CONFIG: {
  key: FilterKey;
  label: string;
}[] = [
  { key: "status", label: "Status" },
  { key: "CaseType", label: "Type" },
  { key: "Module", label: "Module" },
  { key: "projectName", label: "Project" },
  { key: "PaidorNot", label: "Payement Status" },
  { key: "fromIssueDate", label: "From Date" },
  { key: "toIssueDate", label: "To Date" },
];

  const COLUMN_CONFIG: {
    key: ColumnKey;
    label: string;
  }[] = [
    { key: "caseNumber", label: "Case #" },//
    { key: "issueDate", label: "Created" },//
    { key: "projectName", label: "Project" },//
    { key: "issues", label: "Issue" },//
    { key: "paidorNot", label: "Payment Status" },//
    { key: "caseType", label: "Case Type" },//
    { key: "module", label: "Module" },//
    {
      key: "functionalConsultant",
      label: "functional Consultant",//
    },
    { key: "reviewedBy", label: "Reviewed By" },//
    { key: "developer", label: "Developer" },//
    { key: "department", label: "Department" },//
    { key: "status", label: "Status" },//
    { key: "releaseNote", label: "Release Note" },
    { key: "startDate", label: "Start Date" },
    { key: "deadLine", label: "Deadline" },
  ];

  const { data } = useCases();
  const moduleOptions = Array.from(
    new Set(
      (data?.items ?? [])
        .map((x) => x.module)
        .filter(Boolean)
    )
  ).sort();

  const paymentOptions = Array.from(
    new Set(
      (data?.items ?? [])
        .map((x) => x.paidorNot)
        .filter(Boolean)
    )
  ).sort();

  const projectOptions = Array.from(
    new Set(
      (data?.items ?? [])
        .map((x) => x.projectName)
        .filter(Boolean)
    )
  ).sort();

  const {
    filters,
    setFilters,
    resetFilters,
    openCreateModal,
    visibleColumns,
    setVisibleColumns,
  } = useCaseStore();

  //filter
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


  //columns
  useEffect(() => {
    const saved =
      localStorage.getItem("visibleColumns");

    if (saved) {
      const parsed = JSON.parse(saved);

      setVisibleColumns({
        ...visibleColumns,
        ...parsed,
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "visibleColumns",
      JSON.stringify(visibleColumns)
    );
  }, [visibleColumns]);

  // useEffect(() => {
  //   const saved =
  //     localStorage.getItem("visibleColumns");

  //   if (saved) {
  //     setVisibleColumns(JSON.parse(saved));
  //   }
  // }, [setVisibleColumns]);

  const hasActiveFilters =
    Object.values(filters).some(Boolean);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
      {/* TOP */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />

            <Input
              placeholder="Search cases..."
              className="pl-8 h-8 text-sm bg-gray-50"
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
            Add Issue
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* STATUS */}
        {visibleFilters.status && (
          <Select
            value={draftFilters.status || "all"}
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                status:
                  v === "all"
                    ? ""
                    : (v as CaseStatus),
              })
            }
          >
            <SelectTrigger className="w-[170px] bg-gray-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Statuses
              </SelectItem>

              {STATUSES.map((s) => (
                <SelectItem className="bg-white"
                  key={s}
                  value={s}
                >
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* TYPE */}
        {visibleFilters.CaseType && (
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
            <SelectTrigger className="w-[170px] bg-gray-50">
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Types
              </SelectItem>

              {TYPES.map((t) => (
                <SelectItem className="bg-white"
                  key={t}
                  value={t}
                >
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* MODULE */}
        {visibleFilters.Module && (
          <Select
            value={draftFilters.module || "all"}
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                module:
                  v === "all" ? "" : v,
              })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Module" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Modules
              </SelectItem>

              {moduleOptions.map((m) => (
                <SelectItem
                  key={m}
                  value={m}
                >
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}


        {/* Project */}
        {visibleFilters.projectName && (
          <Select
            value={draftFilters.projectName || "all"}
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                projectName:
                  v === "all" ? "" : v,
              })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Projects" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Projects
              </SelectItem>

              {projectOptions.map((m) => (
                <SelectItem className="bg-white"
                  key={m}
                  value={m}
                >
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* PAYMENT */}
        {visibleFilters.PaidorNot && (
          <Select
            value={draftFilters.paidorNot || "all"}
            onValueChange={(v) =>
              setDraftFilters({
                ...draftFilters,
                paidorNot:
                  v === "all" ? "" : v,
              })
            }
          >
            <SelectTrigger className="w-[180px] bg-gray-50">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Payments
              </SelectItem>

              {paymentOptions.map((p) => (
                <SelectItem className="bg-white"
                  key={p}
                  value={p}
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* DATE RANGE */}
        {(visibleFilters.fromIssueDate || visibleFilters.toIssueDate) && (
        <div className="flex items-center gap-2">
          <DateField
            placeholder="From Date"
            value={
              draftFilters.fromIssueDate
            }
            onChange={(value) =>
              setDraftFilters({
                ...draftFilters,
                fromIssueDate: value,
              })
            }
            className="w-[160px] bg-gray-50"
          />

          <DateField
            placeholder="To Date"
            value={
              draftFilters.toIssueDate
            }
            onChange={(value) =>
              setDraftFilters({
                ...draftFilters,
                toIssueDate: value,
              })
            }
            className="w-[160px] bg-gray-50"
          />
        </div>
        )}

        {/* SHOW */}
        <Button
          size="sm"
          onClick={() => {
            if (
              !draftFilters.fromIssueDate ||
              !draftFilters.toIssueDate
            ) {
              alert(
                "Date range is required"
              );

              return;
            }

            setFilters(draftFilters);
          }}
        >
          Show
        </Button>

        {/* CLEAR */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
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