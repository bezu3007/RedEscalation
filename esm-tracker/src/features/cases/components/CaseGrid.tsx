import React, { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community";
import { useVoucherInit } from "../hooks/useVoucherInit";
import { useCases } from "../hooks/useCases";
import { useCaseStore } from "../store/caseStore";
import { StatusBadge } from "./StatusBadge";
import { CaseTypeBadge } from "./CaseTypeBadge";
import type { CaseItem } from "../types";
import { formatDate } from "@/shared/utils/formatDate";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight, ChevronDown,} from "lucide-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { RowMenuCell } from "./RowMenuCell";
// import { CASE_TYPES } from "../types";


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

export function CaseGrid() {
  useVoucherInit();
  const gridRef = useRef<AgGridReact<CaseItem>>(null);
  const { data, isLoading, isFetching } = useCases();
  const { page, pageSize, setPage, visibleColumns, } = useCaseStore();

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
        headerName: "Case Number",
        width: 110,
        pinned: "left",
        cellClass: "font-mono text-xs",
        hide: !visibleColumns.caseNumber,
      },

      {
        field: "projectName",
        headerName: "Project",
        flex: 1,
        minWidth: 150,
        hide: !visibleColumns.projectName,
      },

      {
        field: "issues",
        headerName: "Issues",
        flex: 1,
        minWidth: 150,
        hide: !visibleColumns.issues,
      },

      {
        field: "status",
        headerName: "Status",
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
        field: "reviewedBy",
        headerName: "Reviewed By",
        hide: !visibleColumns.reviewedBy,
        flex: 1,
        minWidth: 150,
      },

      {
        field: "module",
        headerName: "Module",
        hide: !visibleColumns.module,
        width: 100,
        minWidth: 50,
      },
      
      {
        field: "paidorNot",
        headerName: "Payement Status",
        hide: !visibleColumns.paidorNot,
        flex: 1,
        minWidth: 120,
      },

      {
        field: "functionalConsultant",
        headerName: "FunctionalConsultant",
        flex: 1,
        minWidth: 140,
        hide: !visibleColumns.functionalConsultant,
      },

      {
        field: "developer",
        headerName: "Developer",
        flex: 1,
        minWidth: 140,
        hide: !visibleColumns.developer,
        valueFormatter: ({ value }) =>
          value ?? "—",
      },

      {
        field: "department",
        headerName: "Department",
        flex: 1,
        minWidth: 140,
        hide: !visibleColumns.department,
        valueFormatter: ({ value }) =>
          value ?? "—",
      },

      {
        field: "releaseNote",
        headerName: "Release Note",
        flex: 1,
        minWidth: 140,
        hide: !visibleColumns.releaseNote,
      },

      {
        field: "issueDate",
        headerName: "Created",
        width: 130,
        hide: !visibleColumns.issueDate,
        valueFormatter: ({ value }) =>
          value ? formatDate(value) : "—",
        sort: "desc",
      },

      {
        field: "deadLine",
        headerName: "DeadLine",
        width: 130,
        hide: !visibleColumns.deadLine,
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