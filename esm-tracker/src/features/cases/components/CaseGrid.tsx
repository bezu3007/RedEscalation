import React, { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community";
import { useCases } from "../hooks/useCases";
import { useCaseStore } from "../store/caseStore";
import { StatusBadge } from "./StatusBadge";
import { CaseTypeBadge } from "./CaseTypeBadge";
import type { CaseItem, CasePriority } from "../types";
import { formatDate } from "@/shared/utils/formatDate";
import { Button } from "@/shared/components/ui/button";
import { Eye, Pencil, ChevronRight, ChevronDown, MoreVertical, Wrench, LoaderCircle, PlusCircle, X} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { createPortal } from "react-dom";

const PRIORITY_CLASSES: Record<CasePriority, string> = {
  Low: "text-slate-500",
  Medium: "text-blue-600",
  High: "text-orange-600",
  Critical: "text-red-600 font-semibold",
};

function ExpandCell() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="flex items-center justify-center w-full h-full"
    >
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

function RowMenuCell({ data }: ICellRendererParams<CaseItem>) {
  const navigate = useNavigate();

  const {
    openEditModal,
    setSelectedParentCase,
    openCreateModal,
    openViewModal,
  } = useCaseStore();

  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);

  const btnRef = React.useRef<HTMLButtonElement>(null);

  if (!data) return null;

  const toggleMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPos({
      x: rect.left,
      y: rect.bottom,
    });

    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* TRIGGER */}
      <div className="flex items-center justify-center h-full">
        <button
          ref={btnRef}
          onClick={toggleMenu}
          className="h-8 w-8 rounded-md hover:bg-slate-100 flex items-center justify-center"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* MENU */}
      {open &&
        pos &&
        createPortal(
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 z-[998]"
              onClick={() => setOpen(false)}
            />

            {/* PANEL */}
            <div
              className="fixed z-[9999] w-56 rounded-2xl border bg-white shadow-2xl overflow-hidden"
              style={{
                top: pos.y + 6,
                left: pos.x,
              }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <p className="font-medium text-sm">{data.caseNumber}</p>

                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ACTIONS */}
              <div className="p-2 space-y-1">
                {/* VIEW */}
                <button
                  onClick={() => {
                    openViewModal(data);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                >
                  <Eye className="h-4 w-4 text-cyan-500" />
                  View
                </button>

                {/* EDIT */}
                <button
                  onClick={() => {
                    openEditModal(data);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                  Edit
                </button>

                {/* FIXED (optional future action) */}
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm">
                  <Wrench className="h-4 w-4 text-indigo-500" />
                  Mark Fixed
                </button>

                {/* IN PROGRESS */}
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm">
                  <LoaderCircle className="h-4 w-4 text-orange-500" />
                  In Progress
                </button>

                {/* CREATE SUBCASE */}
                <button
                  onClick={() => {
                    setSelectedParentCase(data);
                    openCreateModal();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                >
                  <PlusCircle className="h-4 w-4 text-green-600" />
                  Create Sub Case
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

export function CaseGrid() {
  const gridRef = useRef<AgGridReact<CaseItem>>(null);
  const { data, isLoading, isFetching } = useCases();
  const { page, pageSize, setPage, setPageSize, visibleColumns, } = useCaseStore();

  const colDefs = useMemo<ColDef<CaseItem>[]>(
    () => [
      {
        headerName: "",
        width: 50,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ExpandCell,
      },

      {
        headerName: "",
        width: 30,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: RowMenuCell,
      },

      {
        field: "caseNumber",
        headerName: "Case #",
        width: 110,
        pinned: "left",
        cellClass: "font-mono text-xs",
        hide: !visibleColumns.caseNumber,
      },

      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 150,
        tooltipField: "title",
        hide: !visibleColumns.title,
      },

      {
        field: "status",
        headerName: "Status",
        width: 150,
        hide: !visibleColumns.status,
        cellRenderer: ({
          value,
        }: ICellRendererParams<CaseItem, string>) =>
          value ? (
            <StatusBadge
              status={value as CaseItem["status"]}
            />
          ) : null,
      },

      {
        field: "caseType",
        headerName: "Type",
        width: 120,
        hide: !visibleColumns.caseType,
        cellRenderer: ({
          value,
        }: ICellRendererParams<CaseItem, string>) =>
          value ? (
            <CaseTypeBadge
              type={value as CaseItem["caseType"]}
            />
          ) : null,
      },

      {
        field: "priority",
        headerName: "Priority",
        width: 100,
        hide: !visibleColumns.priority,
        cellRenderer: ({
          value,
        }: ICellRendererParams<CaseItem, string>) =>
          value ? (
            <span
              className={cn(
                "text-sm",
                PRIORITY_CLASSES[
                  value as CasePriority
                ]
              )}
            >
              {value}
            </span>
          ) : null,
      },

      {
        field: "projectName",
        headerName: "Project",
        flex: 1,
        minWidth: 120,
        hide: !visibleColumns.projectName,
      },

      {
        field: "department",
        headerName: "Department",
        flex: 1,
        minWidth: 120,
        hide: !visibleColumns.department,
      },

      {
        field: "assignedDeveloper",
        headerName: "Developer",
        flex: 1,
        minWidth: 140,
        hide: !visibleColumns.assignedDeveloper,
        valueFormatter: ({ value }) =>
          value ?? "—",
      },

      {
        field: "createdAt",
        headerName: "Created",
        width: 130,
        hide: !visibleColumns.createdAt,
        valueFormatter: ({ value }) =>
          value ? formatDate(value) : "—",
        sort: "desc",
      },
    ],
    [visibleColumns]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
    }),
    []
  );

  const onGridReady = useCallback((_: GridReadyEvent) => {}, []);

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="ag-theme-quartz w-full overflow-x-visible"
        style={{ height: "calc(100vh - 280px)", minHeight: 400 }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data?.items ?? []}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          loading={isLoading}
          rowHeight={44}
          headerHeight={44}
          suppressCellFocus
          animateRows
          getRowId={({ data: d }) => String(d.id)}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data
            ? `${data.totalCount} total case${data.totalCount !== 1 ? "s" : ""}`
            : "Loading..."}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>

          <span>
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}