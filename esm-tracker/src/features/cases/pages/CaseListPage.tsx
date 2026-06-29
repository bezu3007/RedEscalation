import { useCaseStore } from "../store/caseStore";
import { CaseGrid } from "../components/CaseGrid";
import { FilterBar } from "../components/FilterBar";
import { CaseForm } from "../components/CaseForm";

export default function CaseListPage() {
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

      <FilterBar />
      <CaseGrid />
      <CaseForm
        mode="create"
        open={isCreateModalOpen}
        onClose={closeCreateModal}
      />

      {editingCase && (
        <CaseForm
          mode="edit"
          initialData={editingCase}
          open={isEditModalOpen}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
}