import type { CaseItem } from "@/features/cases/types";
import { getPlainTextFromHtml } from "@/features/cases/utils/htmlUtils";
import type {
  CloseDiscussionRequest,
  CloseDiscussionResponse,
  OpenDiscussionRequest,
  OpenDiscussionResponse,
  UpdateDiscussionRequest,
  UpdateDiscussionResponse,
} from "../types/discussion.types";

const BOT_API_BASE = (
  import.meta.env.VITE_DISCUSSION_API_BASE_URL || "/bot-api"
)
  .toString()
  .replace(/\/+$/, "");

const CLOSED_CASE_STATUSES = new Set([
  "Solved",
  "Closed",
  "Rejected",
  "Removed",
]);

function toOptionalTrimmedString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function mapCaseItemToOpenDiscussionRequest(
  caseItem: CaseItem
): OpenDiscussionRequest {
  if (caseItem.id === null || caseItem.id === undefined) {
    throw new Error("Cannot open a discussion because this case has no Case ID.");
  }

  const caseNumber = toOptionalTrimmedString(caseItem.caseNumber);
  if (!caseNumber) {
    throw new Error("Cannot open a discussion because this case has no Case Number.");
  }

  const developerId = toOptionalTrimmedString(caseItem.developerId);
  if (!developerId) {
    throw new Error(
      `No developer is assigned to case ${caseNumber}. Assign a developer before opening a Telegram discussion.`
    );
  }

  const plainIssue = getPlainTextFromHtml(caseItem.issues || "");
  const issueText =
    plainIssue || toOptionalTrimmedString(caseItem.issues) || "No issue description provided.";

  const fcId = toOptionalTrimmedString(caseItem.functionalConsultantId);
  const fcName = toOptionalTrimmedString(caseItem.functionalConsultant);
  const reviewerId = toOptionalTrimmedString(caseItem.reviewerId);
  const reviewerName = toOptionalTrimmedString(caseItem.reviewer);

  const payload: OpenDiscussionRequest = {
    caseId: caseItem.id,
    caseNumber,
    issueDate: toOptionalTrimmedString(caseItem.issueDate),
    projectName: toOptionalTrimmedString(caseItem.projectName),
    projectNameId: toOptionalTrimmedString(caseItem.projectNameId),
    issue: issueText,
    caseType: toOptionalTrimmedString(caseItem.caseType),
    module: toOptionalTrimmedString(caseItem.module),
    developmentStatus: toOptionalTrimmedString(caseItem.developmentStatus),
    isUrgent: Boolean(caseItem.isUrgent),
    status: toOptionalTrimmedString(caseItem.status),
    functionalConsultant: {
      employeeId: fcId,
      name: fcName,
    },
    developer: {
      employeeId: developerId,
      name: toOptionalTrimmedString(caseItem.developer),
    },
  };

  if (reviewerId || reviewerName) {
    payload.reviewer = {
      employeeId: reviewerId,
      name: reviewerName,
    };
  }

  return payload;
}

interface BotApiErrorPayload {
  message?: string;
  details?: Array<{ path?: string; message?: string }>;
}

async function postBotEndpoint<TResponse extends { success: boolean }>(
  path: string,
  payload: unknown
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${BOT_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Could not reach the Telegram discussion bot service. Verify the bot service is running."
    );
  }

  let body: (TResponse & BotApiErrorPayload) | null = null;
  try {
    body = (await response.json()) as TResponse & BotApiErrorPayload;
  } catch {
    body = null;
  }

  if (!response.ok || !body?.success) {
    const detailText = body?.details
      ?.map((d) => d.message)
      .filter(Boolean)
      .join(" ");
    const message =
      detailText ||
      body?.message ||
      `Telegram bot API request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return body;
}

export async function openCaseDiscussion(
  caseItem: CaseItem
): Promise<OpenDiscussionResponse> {
  const payload = mapCaseItemToOpenDiscussionRequest(caseItem);
  return postBotEndpoint<OpenDiscussionResponse>("/discussions/open", payload);
}

export async function updateCaseDiscussion(
  payload: UpdateDiscussionRequest
): Promise<UpdateDiscussionResponse> {
  return postBotEndpoint<UpdateDiscussionResponse>("/discussions/update", payload);
}

export async function closeCaseDiscussion(
  payload: CloseDiscussionRequest
): Promise<CloseDiscussionResponse> {
  return postBotEndpoint<CloseDiscussionResponse>("/discussions/close", payload);
}

export async function syncCaseDiscussionOnUpdate(params: {
  caseId: number | string | null | undefined;
  caseNumber?: string;
  previousStatus?: string;
  currentStatus?: string;
  actorName?: string;
  note?: string;
  deadLine?: string;
}): Promise<void> {
  if (params.caseId === null || params.caseId === undefined) {
    return;
  }

  try {
    const nextStatus = toOptionalTrimmedString(params.currentStatus);
    if (nextStatus && CLOSED_CASE_STATUSES.has(nextStatus)) {
      await closeCaseDiscussion({
        caseId: params.caseId,
        caseNumber: toOptionalTrimmedString(params.caseNumber),
        finalStatus: nextStatus,
        closedBy: toOptionalTrimmedString(params.actorName),
        note: toOptionalTrimmedString(params.note),
      });
      return;
    }

    await updateCaseDiscussion({
      caseId: params.caseId,
      caseNumber: toOptionalTrimmedString(params.caseNumber),
      previousStatus: toOptionalTrimmedString(params.previousStatus),
      currentStatus: nextStatus,
      updatedBy: toOptionalTrimmedString(params.actorName),
      note: toOptionalTrimmedString(params.note),
      deadLine: toOptionalTrimmedString(params.deadLine),
    });
  } catch (error) {
    console.warn("Telegram discussion lifecycle sync skipped:", error);
  }
}