import React, { useMemo, useRef, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useCases } from "../hooks/useCases";
import { useCaseStore } from "../store/caseStore";
import { StatusBadge } from "./StatusBadge";
import { CaseTypeBadge } from "./CaseTypeBadge";
import type { CaseItem } from "../types";
import { formatDate } from "@/shared/utils/formatDate";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { RowMenuCell } from "./RowMenuCell";
import { StatusActionPopup } from "./StatusActionPopup";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { getAllowedTransitions } from "../utils/permissions";
import { getPlainTextFromHtml } from "../utils/htmlUtils";

function ExpandCell(props: ICellRendererParams<CaseItem>) {
  const data = props.data;
  const hasChildren = (data?.children ?? []).length > 0;

  if (!hasChildren) {
    return <span className="block h-full" />;
  }

  const expanded = props.context?.expandedRows?.[String(data?.id)] ?? true;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        props.context?.toggleRowExpanded?.(data?.id ?? null, !expanded);
      }}
      className="flex h-full w-full items-center justify-center"
    >
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

function StatusChangeCell(params: ICellRendererParams<CaseItem>) {
  const [showPopup, setShowPopup] = React.useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);
  const data = params.data;
  const userRole = useAuthStore.getState().getUserRole();

  if (!data) return null;

  const effectiveUserRole = userRole ?? UserRole.ADMIN;
  const allowedTransitions = getAllowedTransitions(data.status, data.functionalConsultantId, effectiveUserRole);
  const hasActions = allowedTransitions.length > 0;

  // const canClick = userRole !== UserRole.FUNCTIONAL_CONSULTANT && hasActions;
  const canClick = hasActions;

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

// Custom cell renderer for Issues column with auto-height
function IssuesCellRenderer(params: ICellRendererParams<CaseItem>) {
  const value = params.value;
  
  if (!value) {
    return <span className="text-slate-400">—</span>;
  }

  //use DOMPurify if we want to see the format too in the grid

  const plainText = getPlainTextFromHtml(value);
  
  return (
    <div 
      className="whitespace-pre-wrap break-words py-1"
      style={{ 
        lineHeight: '1.5',
        maxHeight: 'none',
        overflow: 'visible'
      }}
    >
      {plainText || <span className="text-slate-400">—</span>}
    </div>
  );
}

export const CaseGrid = React.memo(function CaseGrid() {
  const gridRef = useRef<AgGridReact<CaseItem>>(null);
  const { data, isLoading, isFetching } = useCases();
  const { page, pageSize, setPage, visibleColumns, setVisibleColumns } = useCaseStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Set default visibility for Issues column if not set
  useEffect(() => {
    if (visibleColumns.issues === undefined) {
      setVisibleColumns({
        ...visibleColumns,
        issues: true,
        caseNumber: visibleColumns.caseNumber ?? true,
        projectName: visibleColumns.projectName ?? true,
        module: visibleColumns.module ?? true,
        status: visibleColumns.status ?? true,
        caseType: visibleColumns.caseType ?? true,
        paidorNot: visibleColumns.paidorNot ?? true,
        developer: visibleColumns.developer ?? true,
        issueDate: visibleColumns.issueDate ?? true,
        deadLine: visibleColumns.deadLine ?? true,
        reviewedBy: visibleColumns.reviewedBy ?? false,
        functionalConsultant: visibleColumns.functionalConsultant ?? false,
        department: visibleColumns.department ?? false,
        releaseNote: visibleColumns.releaseNote ?? false,
      });
    }
  }, [visibleColumns, setVisibleColumns]);

  const toggleRowExpanded = (id: number | null, expanded: boolean) => {
    if (id == null) return;
    setExpandedRows((prev) => ({ ...prev, [String(id)]: expanded }));
  };

  const rowData = useMemo(() => {
    const rows = data?.items ?? [];
    if (!rows.length) return [];

    const visit = (items: CaseItem[]): CaseItem[] =>
      items.flatMap((item) => {
        const isExpanded = expandedRows[String(item.id)] ?? true;
        const row = { ...item, expanded: item.children?.length ? isExpanded : undefined };
        if (!item.children?.length) return [row];
        return [row, ...(isExpanded ? visit(item.children) : [])];
      });

    return visit(rows);
  }, [data?.items, expandedRows]);

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
        cellRendererParams: {
          context: {
            toggleRowExpanded,
            expandedRows,
          },
        },
        // Don't auto-height for this column
        autoHeight: false,
      },
      {
        headerName: "",
        width: 30,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: RowMenuCell,
        autoHeight: false,
      },
      {
        field: "caseNumber",
        headerName: "Case #",
        width: 120,
        pinned: "left",
        cellClass: "font-mono text-xs",
        hide: !visibleColumns.caseNumber,
        autoHeight: false,
      },
      {
        field: "projectName",
        headerName: "Project",
        width: 220,
        pinned: "left",
        minWidth: 120,
        hide: !visibleColumns.projectName,
        autoHeight: false,
        cellClass: "truncate",
      },
      {
        field: "module",
        headerName: "Module",
        width: 140,
        hide: !visibleColumns.module,
        minWidth: 120,
        autoHeight: false,
      },
      {
        field: "issues",
        headerName: "Issues",
        width: 300,
        minWidth: 140,
        hide: !visibleColumns.issues,
        cellRenderer: IssuesCellRenderer,
        autoHeight: true,
        wrapText: true,
        cellClass: "align-top",
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        hide: !visibleColumns.status,
        cellRenderer: StatusChangeCell,
        autoHeight: false,
      },
      {
        field: "caseType",
        headerName: "Type",
        width: 150,
        hide: !visibleColumns.caseType,
        cellRenderer: ({ value }: ICellRendererParams<CaseItem, string>) =>
          value ? <CaseTypeBadge type={value as CaseItem["caseType"]} /> : null,
        autoHeight: false,
      },
      {
        field: "reviewer",
        headerName: "Reviewed By",
        width: 180,
        minWidth: 150,
        hide: !visibleColumns.reviewedBy,
        autoHeight: false,
      },
      {
        field: "paidorNot",
        headerName: "Payment Status",
        width: 150,
        minWidth: 120,
        hide: !visibleColumns.paidorNot,
        autoHeight: false,
      },
      {
        field: "functionalConsultant",
        headerName: "Functional Consultant",
        width: 250,
        minWidth: 140,
        hide: !visibleColumns.functionalConsultant,
        autoHeight: false,
      },
      {
        field: "developer",
        headerName: "Developer",
        flex: 1,
        minWidth: 180,
        hide: !visibleColumns.developer,
        valueFormatter: ({ value }) => value ?? "—",
        autoHeight: false,
      },
      {
        field: "department",
        headerName: "Department",
        width: 160,
        minWidth: 140,
        hide: !visibleColumns.department,
        valueFormatter: ({ value }) => value ?? "—",
        autoHeight: false,
      },
      {
        field: "releaseNote",
        headerName: "Release Note",
        width: 160,
        minWidth: 140,
        hide: !visibleColumns.releaseNote,
        autoHeight: false,
      },
      {
        field: "issueDate",
        headerName: "Created",
        width: 130,
        hide: !visibleColumns.issueDate,
        valueFormatter: ({ value }) => (value ? formatDate(value) : "—"),
        sort: "desc",
        autoHeight: false,
      },
      {
        field: "deadLine",
        headerName: "Deadline",
        width: 130,
        hide: !visibleColumns.deadLine,
        valueFormatter: ({ value }) => (value ? formatDate(value) : "—"),
        autoHeight: false,
      },
    ],
    [visibleColumns, expandedRows]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
    }),
    []
  );

  const totalPages = Math.max(1, data ? Math.ceil(data.totalCount / pageSize) : 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="case-grid-container" style={{ height: "calc(100vh - 300px)", minHeight: 400 }}>
        <div className="ag-theme-quartz" style={{ minWidth: "max-content", width: "100%", height: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            loading={isLoading}
            rowHeight={44}
            headerHeight={44}
            suppressCellFocus
            animateRows
            getRowId={({ data: d }) => String(d.id)}
            getRowStyle={(params: any) => {
              const depth = (params.data?.treePath?.length ?? 1) - 1;
              const indent = depth * 18;
              const baseStyle: Record<string, string | number> = {
                paddingLeft: `${indent + 8}px`,
              };

              if (params.data?.isUrgent === true) {
                return {
                  ...baseStyle,
                  background: "#fee2e2",
                  borderLeft: "3px solid #ef4444",
                };
              }

              if (params.data?.isSubcase === true || params.data?.isSubcase === "true") {
                return {
                  ...baseStyle,
                  background: "#dadada",
                  borderLeft: "3px solid #808080",
                };
              }

              return baseStyle;
            }}
            getRowClass={(params: any) => (
              params.data?.isSubcase === true || params.data?.isSubcase === "true"
                ? "subcase-row"
                : params.data?.isUrgent
                  ? "urgent-row"
                  : ""
            )}
            gridOptions={{
              onGridReady: () => {
                // Additional grid configuration if needed
              },
            }}
          />
        </div>
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