// CaseListPage.tsx
import { useCaseStore } from "../store/caseStore";
import { CaseGrid } from "../components/CaseGrid";
import { FilterBar } from "../components/FilterBar";
import { CaseForm } from "../components/CaseForm";
import { useVoucherInit } from "../hooks/useVoucherInit";
import { StatusActionPopup } from "../components/StatusActionPopup";

export default function CaseListPage() {
  // const {userRole } = useAuthStore();
  
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
    statusPopup,
    closeStatusPopup,
  } = useCaseStore();

  const handleStatusUpdate = (newStatus: string) => {
    console.log('Status updated to:', newStatus);
  };

  return (
    <div className="space-y-4">

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

      {viewModal.isOpen && viewModal.data && (
        <CaseForm
          mode="view"
          initialData={viewModal.data}
          open={viewModal.isOpen}
          onClose={closeViewModal}
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