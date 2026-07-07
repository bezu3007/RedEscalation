import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
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
import {StatusActionPopup} from "./StatusActionPopup";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { getAllowedTransitions } from "../utils/permissions";



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

export const CaseGrid = React.memo( function CaseGrid() {
  const gridRef = useRef<AgGridReact<CaseItem>>(null);
  const { data, isLoading, isFetching } = useCases();
  const { page, pageSize, setPage, visibleColumns, } = useCaseStore();

  // const navigate = useNavigate();
  // const onRowClicked = (params: any) => {
  //   navigate(`/cases/${params.data.id}`);
  // };
  // Inside CaseGrid.tsx - Update StatusChangeCell

  function StatusChangeCell(params: ICellRendererParams<CaseItem>) {
    const [showPopup, setShowPopup] = React.useState(false);
    const cellRef = React.useRef<HTMLDivElement>(null);
    const data = params.data;
    const userRole = useAuthStore.getState().getUserRole();

    if (!data) return null;

    // Check if user has any actions for this status
    const effectiveUserRole = userRole ?? UserRole.ADMIN
    const allowedTransitions = getAllowedTransitions(data.status, effectiveUserRole);
    const hasActions = allowedTransitions.length > 0;

    // FC should never be able to click
    const canClick = userRole !== UserRole.FUNCTIONAL_CONSULTANT && hasActions;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canClick) return;
      setShowPopup(true);
    };

    return (
      <div 
        ref={cellRef} 
        onClick={handleClick} 
        className={`${canClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        <StatusBadge status={data.status} />
        {showPopup && (
          <StatusActionPopup
            caseItem={data}
            onClose={() => setShowPopup(false)}
            anchorEl={cellRef.current}
          />
        )}
      </div>
    );
  }
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
        width: 130,
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
        field: "module",
        headerName: "Module",
        hide: !visibleColumns.module,
        width: 150,
        minWidth: 50,
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
        width: 120,
        hide: !visibleColumns.status,
        cellRenderer: StatusChangeCell,
      },

      {
        field: "caseType",
        headerName: "Type",
        width: 150,
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
        field: "paidorNot",
        headerName: "Payement Status",
        hide: !visibleColumns.paidorNot,
        flex: 1,
        minWidth: 120,
      },

      {
        field: "functionalConsultant",
        headerName: "FunctionalConsultant",
        width: 250,
        minWidth: 140,
        hide: !visibleColumns.functionalConsultant,
      },

      {
        field: "developer",
        headerName: "Developer",
        width: 250,
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

  const totalPages = Math.max(1,data ? Math.ceil(data.totalCount / pageSize) : 1);

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
          loading={isLoading}
          rowHeight={44}
          headerHeight={44}
          suppressCellFocus
          animateRows
          getRowId={({ data: d }) => String(d.id)}
          rowClass="hover:bg-slate-50"
          // onRowClicked={onRowClicked}
          // rowClass="cursor-pointer hover:bg-slate-50" 
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
});