import { Loader2, MessageSquare } from "lucide-react";
import type { CaseItem } from "@/features/cases/types";
import { openCaseDiscussion } from "../services/discussionApi";
import { useDiscussionStore } from "../store/discussionStore";

interface OpenDiscussionActionProps {
  caseItem: CaseItem;
  onCompleted?: () => void;
}

export function OpenDiscussionAction({
  caseItem,
  onCompleted,
}: OpenDiscussionActionProps) {
  const { openingCaseId, setOpeningCaseId, showSuccess, showError } =
    useDiscussionStore();

  const currentCaseKey =
    caseItem.id !== null && caseItem.id !== undefined
      ? String(caseItem.id)
      : caseItem.caseNumber;

  const isLoading = openingCaseId !== null && openingCaseId === currentCaseKey;
  const isAnyLoading = openingCaseId !== null;

  const handleOpenDiscussion = async () => {
    if (isAnyLoading) {
      return;
    }

    setOpeningCaseId(currentCaseKey);
    try {
      const response = await openCaseDiscussion(caseItem);
      showSuccess(response);
      onCompleted?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while opening the Telegram discussion.";
      showError("Unable to Open Discussion", message);
      onCompleted?.();
    } finally {
      setOpeningCaseId(null);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleOpenDiscussion()}
      disabled={isAnyLoading}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 text-sky-600 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4 text-sky-600" />
      )}
      {isLoading ? "Opening Discussion..." : "Open Discussion"}
    </button>
  );
}