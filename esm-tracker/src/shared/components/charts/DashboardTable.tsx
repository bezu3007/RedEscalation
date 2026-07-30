import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { useMemo, useRef } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

interface DeveloperRow {
  developerName: string;
  totalCases: number;
  solvedCases: number;
  fixedCases: number;
  overdueCases: number;
}

interface DashboardTableProps {
  rows: DeveloperRow[];
}

export function DashboardTable({ rows }: DashboardTableProps) {
  const gridRef = useRef<AgGridReact<DeveloperRow>>(null);

  const colDefs = useMemo<ColDef<DeveloperRow>[]>(() => [
    { field: "developerName", headerName: "Developer Name", flex: 1.4, minWidth: 160 },
    { field: "totalCases", headerName: "Total Cases", flex: 1, minWidth: 120 },
    { field: "solvedCases", headerName: "Solved Cases", flex: 1, minWidth: 120 },
    { field: "fixedCases", headerName: "Fixed Cases", flex: 1, minWidth: 120 },
    { field: "overdueCases", headerName: "Overdue Cases", flex: 1, minWidth: 120 },
  ], []);

  return (
    <div className="ag-theme-quartz w-full rounded-xl border border-slate-200 bg-white p-2">
      <AgGridReact<DeveloperRow>
        ref={gridRef}
        rowData={rows}
        columnDefs={colDefs}
        defaultColDef={{ sortable: true, resizable: true, filter: true }}
        domLayout="autoHeight"
        suppressCellFocus
        suppressHorizontalScroll
      />
    </div>
  );
}
