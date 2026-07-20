import React from "react";
import { createPortal } from "react-dom";
import { useCaseStore } from "../store/caseStore";
import type { ICellRendererParams } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
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

export function RowMenuCell(params: ICellRendererParams) {
  const data = params.data;
  const navigate = useNavigate();
  const { openEditModal, openCreateModal, openViewModal } = useCaseStore();
  const userRole = useAuthStore((state) => state.userRole);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number; anchor: 'bottom' | 'top' } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  if (!data) return null;

  const isDeveloper = userRole === UserRole.DEVELOPER;
  const isFunctionalConsultant = userRole === UserRole.FUNCTIONAL_CONSULTANT;
  
  let canEdit = false;

  if(isDeveloper){
    canEdit = false;
  }
  else if(isFunctionalConsultant){
    canEdit = data.status === "Prepared" || data.status === "Returned";
  }
  else{
    canEdit = true;
  }
  
  const canAddSubcase = !isDeveloper;
  const canExtendDeadline = !isDeveloper;
  
  // Calculate menu height based on visible items
  const getMenuHeight = () => {
    let itemCount = 1; // View is always visible
    if (canEdit) itemCount++;
    if (canAddSubcase) itemCount++;
    if (canExtendDeadline) itemCount++;
    
    // Add spacing for header, borders, and padding
    // Each item ~40px, header ~50px, padding ~16px, borders ~2px
    return (itemCount * 40) + 50 + 16 + 2;
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuHeight = getMenuHeight();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Check if there's enough space below, if not, position above
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
    useCaseStore.getState().setSelectedParentCase(data);
    openCreateModal();
    setOpen(false);
  };

  const handleDeadlineExtend = () => {
    navigate(`/cases/${data.id}/extend-deadline`);
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
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}