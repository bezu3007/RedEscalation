import { useCaseStore } from "../store/caseStore";
import { CaseGrid } from "../components/CaseGrid";
import { FilterBar } from "../components/FilterBar";
import { CaseForm } from "../components/CaseForm";
import { useVoucherInit } from "../hooks/useVoucherInit";
import { Loader2 } from "lucide-react";

export default function CaseListPage() {
  const { data: initData} = useVoucherInit();
  const {
    isCreateModalOpen,
    isEditModalOpen,
    editingCase,
    //openCreateModal,
    closeCreateModal,
    closeEditModal,
  } = useCaseStore();


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track escalation cases
          </p>
        </div>
      </div>

      <FilterBar 
          initData={initData}/>
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
    </div>
  );
}