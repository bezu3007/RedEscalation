// CaseListPage.tsx
import { useEffect, useState } from "react";
import { useCaseStore } from "../store/caseStore";
import { CaseGrid } from "../components/CaseGrid";
import { FilterBar } from "../components/FilterBar";
import { CaseForm } from "../components/CaseForm";
import { useVoucherInit } from "../hooks/useVoucherInit";
import { StatusActionPopup } from "../components/StatusActionPopup";
import { ActivityLogDialog } from "../components/ActvityLogDialog";
import { StatusDialog } from "@/shared/components/ui/status-dialog";

export default function CaseListPage() {
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const { data: initData } = useVoucherInit();
  console.log("Voucher init data:", initData);
  
  // Get all needed store values
  const {
    isCreateModalOpen,
    isEditModalOpen,
    editingCase,
    closeCreateModal,
    closeEditModal,
    viewModal,
    closeViewModal,
    activityLogModal,
    closeActivityLogModal,
    statusPopup,
    closeStatusPopup,
  } = useCaseStore();

  useEffect(() => {
    if (!confirmationMessage) return;
    const timer = window.setTimeout(() => setConfirmationMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmationMessage]);

  const handleStatusUpdate = (newStatus: string) => {
    setConfirmationMessage(`Status changed to ${newStatus}.`);
    setDialogOpen(true);
    console.log('Status updated to:', newStatus);
  };

  const handleSuccessMessage = (message: string) => {
    setConfirmationMessage(message);
    setDialogOpen(true);
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <StatusDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setConfirmationMessage(null);
        }}
        title="Success"
        message={confirmationMessage ?? ""}
        autoCloseMs={1500}
        hideOk={true}
      />
      <FilterBar initData={initData} />
      <CaseGrid />
      
      {isCreateModalOpen && (
        <CaseForm
          mode="create"
          open={true}
          onClose={closeCreateModal}
          initData={initData}
          onSuccess={(_title, message) => handleSuccessMessage(message)}
        />
      )}

      {editingCase && (
        <CaseForm
          mode="edit"
          initialData={editingCase}
          open={isEditModalOpen}
          onClose={closeEditModal}
          initData={initData}
          onSuccess={(_title, message) => handleSuccessMessage(message)}
        />
      )}

      {viewModal.isOpen && viewModal.data && (
        <CaseForm
          mode="view"
          initialData={viewModal.data}
          open={viewModal.isOpen}
          onClose={closeViewModal}
          initData={initData}
        />
      )}

      {activityLogModal.isOpen && (
        <ActivityLogDialog
          open={activityLogModal.isOpen}
          caseId={activityLogModal.data?.id ?? undefined}
          caseNumber={activityLogModal.data?.caseNumber}
          onClose={closeActivityLogModal}
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