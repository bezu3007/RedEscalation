import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useDiscussionStore } from "../store/discussionStore";
import type { ParticipantSyncResult } from "../types/discussion.types";

function formatParticipantAction(participant: ParticipantSyncResult): string {
  switch (participant.action) {
    case "ALREADY_MEMBER":
      return "Already in group";
    case "INVITED":
      return "Invitation sent via Telegram DM";
    case "INVITE_REUSED":
      return "Active invitation re-sent via Telegram DM";
    case "REQUIRES_BOT_START":
      return "Waiting for /start in Telegram";
    case "UNMAPPED_TELEGRAM_ID":
      return "Telegram ID not configured";
    case "CHECK_FAILED":
      return "Membership check failed";
  }
}

export function DiscussionStatusDialog() {
  const { notification, clearNotification } = useDiscussionStore();

  if (!notification) {
    return null;
  }

  const isSuccess = notification.variant === "success";
  const participants = notification.response?.participants ?? [];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && clearNotification()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="relative flex justify-center mb-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${
                isSuccess ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <AlertCircle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription>{notification.message}</DialogDescription>
        </DialogHeader>

        {participants.length > 0 && (
          <div className="mt-2 space-y-2 rounded-xl border bg-slate-50 p-3 text-xs">
            <p className="font-semibold text-slate-700">Participants</p>
            {participants.map((participant) => (
              <div
                key={`${participant.role}-${participant.employeeId}`}
                className="space-y-0.5 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {participant.name} ({participant.role})
                  </span>
                  <span className="text-slate-600">
                    {formatParticipantAction(participant)}
                  </span>
                </div>
                {participant.instruction && (
                  <p className="text-slate-600">{participant.instruction}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <Button className="mt-4 w-full" onClick={clearNotification}>
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}