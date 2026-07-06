// CaseListPage.tsx
import { useCaseStore } from "../store/caseStore";
import { CaseGrid } from "../components/CaseGrid";
import { FilterBar } from "../components/FilterBar";
import { CaseForm } from "../components/CaseForm";
import { useVoucherInit } from "../hooks/useVoucherInit";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth/types";
import { StatusActionPopup } from "../components/StatusActionPopup";

export default function CaseListPage() {
  const { user, userRole } = useAuthStore();

  const getPageTitle = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return "Admin Dashboard - All Cases";
      case UserRole.DEVELOPER:
        return "My Assigned Cases";
      case UserRole.FUNCTIONAL_CONSULTANT:
        return "My Prepared Cases";
      case UserRole.PROJECT_MANAGER:
        return "FC Cases - Review";
      default:
        return "Cases";
    }
  };

  const getPageDescription = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return "Full system administration view - all cases";
      case UserRole.DEVELOPER:
        return "View and manage cases assigned to you";
      case UserRole.FUNCTIONAL_CONSULTANT:
        return "Track your prepared cases through the lifecycle";
      case UserRole.PROJECT_MANAGER:
        return "Review and manage cases from your functional consultants";
      default:
        return "Manage and track escalation cases";
    }
  };
  
  const { data: initData } = useVoucherInit();
  
  // Get all needed store values
  const {
    isCreateModalOpen,
    isEditModalOpen,
    editingCase,
    closeCreateModal,
    closeEditModal,
    statusPopup,        // Add this
    closeStatusPopup,   // Add this
  } = useCaseStore();

  // Function to handle status update
  const handleStatusUpdate = (newStatus: string) => {
    console.log('Status updated to:', newStatus);
    // You might want to refresh the case list here
    // Or update the local state if needed
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>
        {(userRole === UserRole.FUNCTIONAL_CONSULTANT || userRole === UserRole.ADMIN) && (
          <button>Create Case</button>
        )}
      </div>

      <FilterBar initData={initData} />
      <CaseGrid />
      
      {isCreateModalOpen && (
        <CaseForm
          mode="create"
          open={true}
          onClose={closeCreateModal}
          initData={initData}
        />
      )}

      {editingCase && (
        <CaseForm
          mode="edit"
          initialData={editingCase}
          open={isEditModalOpen}
          onClose={closeEditModal}
          initData={initData}
        />
      )}

      {/* Status Popup */}
      {statusPopup.isOpen && statusPopup.caseItem && statusPopup.anchorEl && (
        <StatusActionPopup
          caseItem={statusPopup.caseItem}
          anchorEl={statusPopup.anchorEl}
          onClose={() => {
            console.log('🔄 Closing popup from parent');
            closeStatusPopup();
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}