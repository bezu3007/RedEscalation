import { create } from "zustand";
import type { OpenDiscussionResponse } from "../types/discussion.types";
import type { TelegramLaunchTarget } from "../utils/telegramLinks";

export interface DiscussionNotification {
  variant: "success" | "error";
  title: string;
  message: string;
  response?: OpenDiscussionResponse;
  telegramTarget?: TelegramLaunchTarget;
}

interface DiscussionUIState {
  openingCaseId: string | null;
  notification: DiscussionNotification | null;
  setOpeningCaseId: (caseId: string | null) => void;
  showSuccess: (
    response: OpenDiscussionResponse,
    telegramTarget?: TelegramLaunchTarget
  ) => void;
  showError: (title: string, message: string) => void;
  clearNotification: () => void;
}

export const useDiscussionStore = create<DiscussionUIState>((set) => ({
  openingCaseId: null,
  notification: null,
  setOpeningCaseId: (openingCaseId) => set({ openingCaseId }),
  showSuccess: (response, telegramTarget) =>
    set({
      notification: {
        variant: "success",
        title: response.existing
          ? "Existing Discussion Reused"
          : "Telegram Discussion Created",
        message: response.existing
          ? `Case ${response.caseNumber} already has an active Telegram topic (Thread #${response.messageThreadId}).`
          : `Created Telegram topic for case ${response.caseNumber} (Thread #${response.messageThreadId}).`,
        response,
        telegramTarget,
      },
    }),
  showError: (title, message) =>
    set({
      notification: {
        variant: "error",
        title,
        message,
      },
    }),
  clearNotification: () => set({ notification: null }),
}));