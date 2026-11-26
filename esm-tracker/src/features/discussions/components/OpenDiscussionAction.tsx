import { Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { CaseItem } from "@/features/cases/types";
import { openCaseDiscussion } from "../services/discussionApi";
import { useDiscussionStore } from "../store/discussionStore";
import {
  launchTelegramUrl,
  resolveTelegramDestination,
} from "../utils/telegramLinks";

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
  const currentEmployeeId = useAuthStore(
    (s) => s.personId ?? s.user?.person ?? s.user?.id
  );

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
      const target = resolveTelegramDestination(response, currentEmployeeId);
      const autoLaunchAttempted = target.primaryUrl
        ? launchTelegramUrl(target.primaryUrl)
        : false;

      showSuccess(response, {
        ...target,
        autoLaunchAttempted,
      });
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