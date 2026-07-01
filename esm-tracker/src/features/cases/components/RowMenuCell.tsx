import React from "react";
import { createPortal } from "react-dom";
import { useCaseStore } from "../store/caseStore";
import type { ICellRendererParams } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Pencil, 
  MoreVertical, 
  X, 
  PlusCircle, 
  Clock3 
} from "lucide-react";

export function RowMenuCell(params: ICellRendererParams) {
  const data = params.data;
  const navigate = useNavigate();
  const { openEditModal, openCreateModal, openViewModal } = useCaseStore();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  if (!data) return null;

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPos({
      x: rect.left,
      y: rect.bottom,
    });

    setOpen((prev) => !prev);
  };

  const handleEdit = () => {
    openEditModal(data);
    setOpen(false);
  };

  const handleSubCase = () => {
    // Set parent case and open create modal
    useCaseStore.getState().setSelectedParentCase(data);
    openCreateModal();
    setOpen(false);
  };

  const handleDeadlineExtend = () => {
    // Open deadline extension modal
    // You can either use a store action or navigate to a deadline page
    navigate(`/cases/${data.id}/extend-deadline`);
    setOpen(false);
  };

  return (
    <>
      <div 
        className="flex items-center justify-center h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={btnRef}
          onClick={toggleMenu}
          className="h-8 w-8 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {open && pos && createPortal(
        <>
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-[9999] w-56 rounded-2xl border bg-white shadow-2xl overflow-hidden"
            style={{
              top: pos.y + 6,
              left: pos.x,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <p className="font-medium text-sm truncate">{data.caseNumber}</p>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2 space-y-0.5">
              {/* View */}
              <button
                type="button"
                onClick={() => {
                  navigate(`/cases/${data.id}`);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <Eye className="h-4 w-4 text-cyan-500" />
                View Details
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={handleEdit}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
                Edit Case
              </button>

              <div className="my-2 border-t" />

              {/* Add Subcase */}
              <button
                type="button"
                onClick={handleSubCase}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4 text-green-600" />
                Add Subcase
              </button>

              {/* Deadline Extension */}
              <button
                type="button"
                onClick={handleDeadlineExtend}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <Clock3 className="h-4 w-4 text-violet-600" />
                Extend Deadline
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}