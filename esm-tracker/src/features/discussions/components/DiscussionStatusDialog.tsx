import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useDiscussionStore } from "../store/discussionStore";
// import type { ParticipantSyncResult } from "../types/discussion.types";

// function formatParticipantAction(participant: ParticipantSyncResult): string {
//   switch (participant.action) {
//     case "ALREADY_MEMBER":
//       return "Already in group";
//     case "INVITED":
//       return "Invitation sent via Telegram DM";
//     case "INVITE_REUSED":
//       return "Active invitation re-sent via Telegram DM";
//     case "REQUIRES_BOT_START":
//       return "Waiting for /start in Telegram";
//     case "UNMAPPED_TELEGRAM_ID":
//       return "Telegram ID not configured";
//     case "CHECK_FAILED":
//       return "Membership check failed";
//   }
// }

export function DiscussionStatusDialog() {
  const { notification, clearNotification } = useDiscussionStore();

  if (!notification) {
    return null;
  }

  const isSuccess = notification.variant === "success";
  const participants = notification.response?.participants ?? [];
  const target = notification.telegramTarget;

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

        {isSuccess && target?.needsBotInviteFirst && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Accept your group invitation in the Telegram bot chat first, then open the discussion topic.
          </div>
        )}

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
                  {/* <span className="text-slate-600">
                    {formatParticipantAction(participant)}
                  </span> */}
                </div>
                {/* {participant.instruction && (
                  <p className="text-slate-600">{participant.instruction}</p>
                )} */}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {isSuccess && target?.primaryUrl && (
            <a
              href={target.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={clearNotification}
              className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {target.primaryLabel}
            </a>
          )}

          {isSuccess &&
            target?.needsBotInviteFirst &&
            target.topicUrl &&
            target.topicUrl !== target.primaryUrl && (
              <a
                href={target.topicUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={clearNotification}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Topic (after joining)
              </a>
            )}

          <Button
            variant={isSuccess && target?.primaryUrl ? "ghost" : "primary"}
            className="w-full"
            onClick={clearNotification}
          >
            {isSuccess && target?.primaryUrl ? "Close" : "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}