import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { CaseItem, VoucherInitResult } from "@/features/cases/types";
import { findTelegramMappingByPhone } from "@/shared/utils/tgMapper";
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
  const queryClient = useQueryClient();
  const { openingCaseId, setOpeningCaseId, showSuccess, showError } =
    useDiscussionStore();
  const authUser = useAuthStore((s) => s.user);
  const personId = useAuthStore((s) => s.personId);
  const userRole = useAuthStore((s) => s.userRole);

  const currentEmployeeId = personId ?? authUser?.person ?? authUser?.id;

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
      const voucherInit = queryClient.getQueryData<VoucherInitResult>([
        "voucher-init",
      ]);

      const empIdStr =
        currentEmployeeId !== null && currentEmployeeId !== undefined
          ? String(currentEmployeeId).trim()
          : "";
      const fallbackConsigneePhone = empIdStr
        ? voucherInit?.developers?.find((d) => String(d.id).trim() === empIdStr)
            ?.phoneNo ??
          voucherInit?.functionalConsultants?.find(
            (f) => String(f.id).trim() === empIdStr
          )?.phoneNo
        : undefined;

      const currentPhone =
        authUser?.phoneNumber ??
        authUser?.personConsigneeUnit?.phone1 ??
        (authUser as { phone1?: string } | null)?.phone1 ??
        (authUser?.personInfo as { phone1?: string } | undefined)?.phone1 ??
        fallbackConsigneePhone ??
        undefined;
      const currentTelegramId =
        findTelegramMappingByPhone(currentPhone)?.telegramId ??
        authUser?.telegramId;

      const response = await openCaseDiscussion(caseItem, {
        voucherInit,
        requestedBy: {
          employeeId: currentEmployeeId,
          name: authUser?.fullName || authUser?.userName,
          role: userRole,
          phoneNumber: currentPhone,
          telegramId: currentTelegramId,
        },
      });

      const target = resolveTelegramDestination(
        response,
        currentEmployeeId,
        currentPhone,
        currentTelegramId
      );
      const autoLaunchAttempted =
        target.shouldAutoLaunch !== false && target.primaryUrl
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