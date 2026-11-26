import { create } from "zustand";
import type { OpenDiscussionResponse } from "../types/discussion.types";

export interface DiscussionNotification {
  variant: "success" | "error";
  title: string;
  message: string;
  response?: OpenDiscussionResponse;
}

interface DiscussionUIState {
  openingCaseId: string | null;
  notification: DiscussionNotification | null;
  setOpeningCaseId: (caseId: string | null) => void;
  showSuccess: (response: OpenDiscussionResponse) => void;
  showError: (title: string, message: string) => void;
  clearNotification: () => void;
}

export const useDiscussionStore = create<DiscussionUIState>((set) => ({
  openingCaseId: null,
  notification: null,
  setOpeningCaseId: (openingCaseId) => set({ openingCaseId }),
  showSuccess: (response) =>
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