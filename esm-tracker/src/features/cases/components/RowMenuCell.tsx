import React from "react";
import { createPortal } from "react-dom";
import { useCaseStore } from "../store/caseStore";
import type { ICellRendererParams } from "ag-grid-community";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { 
  Eye, 
  Pencil, 
  MoreVertical, 
  X, 
  PlusCircle, 
  Clock3 
} from "lucide-react";
import { ExtendDeadlinePopup } from "./ExtendDeadlinePopup";

export function RowMenuCell(params: ICellRendererParams) {
  const data = params.data;
  const { openEditModal, openCreateModal, openViewModal, openActivityLogModal } = useCaseStore();
  const userRole = useAuthStore((state) => state.userRole);
  const [open, setOpen] = React.useState(false);
  const [showExtendPopup, setShowExtendPopup] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number; anchor: 'bottom' | 'top' } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  if (!data) return null;

  const isDeveloper = userRole === UserRole.DEVELOPER;
  const isFunctionalConsultant = userRole === UserRole.FUNCTIONAL_CONSULTANT;
  const isProjectManager = userRole === UserRole.PROJECT_MANAGER;
  
  let canEdit = false;

  if(isDeveloper){
    canEdit = false;
  }
  if(data.status === "Solved" || data.status === "Rejected"){
    canEdit = false;
  }
  if(isFunctionalConsultant){
    canEdit = data.status === "Prepared" || data.status === "Returned";
  }else if(isFunctionalConsultant || isProjectManager){
    if(data.status === "Accepted" || data.status === "On Progress" || data.status === "Fixed" || data.status === "Solved" || data.status === "Not Solved"){
      canEdit = false;
    }
  }
  else{
    canEdit = true;
  }
  
  const isBlockedSubcase = ["Solved", "Rejected"].includes(data.status);
  const canAddSubcase = !isDeveloper && !isBlockedSubcase;
  const canExtendDeadline =
    !isDeveloper &&
    !["Prepared", "Edited", "Returned", "Reviewed", "Rejected", "Not Solved"].includes(data.status);
  
  const getMenuHeight = () => {
    let itemCount = 1;
    if (canEdit) itemCount++;
    if (canAddSubcase) itemCount++;
    if (canExtendDeadline) itemCount++;
  
    return (itemCount * 40) + 50 + 16 + 2;
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuHeight = getMenuHeight();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const showBelow = spaceBelow >= menuHeight;
    
    setPos({
      x: rect.left,
      y: showBelow ? rect.bottom : rect.top,
      anchor: showBelow ? 'bottom' : 'top',
    });

    setOpen((prev) => !prev);
  };

  const handleEdit = () => {
    openEditModal(data);
    setOpen(false);
  };

  const handleView = () => {
    openViewModal(data);
    setOpen(false);
  };

  const handleSubCase = () => {
    if (isBlockedSubcase) {
      setOpen(false);
      return;
    }

    useCaseStore.getState().setSelectedParentCase(data);
    console.log("Selected Parent Case:", useCaseStore.getState().selectedParentCase);
    openCreateModal();
    setOpen(false);
  };

  const handleDeadlineExtend = () => {
    setShowExtendPopup(true);
    setOpen(false);
  };

  const handleActivityLog = () => {
    openActivityLogModal(data);
    setOpen(false);
  };

  // Handle window resize to close menu if open
  React.useEffect(() => {
    const handleResize = () => {
      if (open) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

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
              top: pos.anchor === 'bottom' ? pos.y + 6 : pos.y - 6,
              left: pos.x,
              transform: pos.anchor === 'top' ? 'translateY(-100%)' : 'none',
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
                onClick={handleView}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <Eye className="h-4 w-4 text-cyan-500" />
                View Details
              </button>

              {/* Edit - Hidden for developers */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                  Edit Case
                </button>
              )}

              {(canAddSubcase || canExtendDeadline) && <div className="my-2 border-t" />}

              {/* Add Subcase - Hidden for developers */}
              {canAddSubcase && (
                <button
                  type="button"
                  onClick={handleSubCase}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
                >
                  <PlusCircle className="h-4 w-4 text-green-600" />
                  Add Subcase
                </button>
              )}

              {/* Deadline Extension - Hidden for developers */}
              {canExtendDeadline && (
                <button
                  type="button"
                  onClick={handleDeadlineExtend}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
                >
                  <Clock3 className="h-4 w-4 text-violet-600" />
                  Extend Deadline
                </button>
              )}
              <button
                type="button"
                onClick={handleActivityLog}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors"
              >
                <Clock3 className="h-4 w-4 text-violet-600" />
                Activity Log
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {showExtendPopup && (
        <ExtendDeadlinePopup
          caseItem={data}
          anchorEl={btnRef.current}
          onClose={() => setShowExtendPopup(false)}
          onExtended={() => setShowExtendPopup(false)}
        />
      )}
    </>
  );
}