import type { CaseItem } from "@/features/cases/types";
import { getPlainTextFromHtml } from "@/features/cases/utils/htmlUtils";
import type {
  OpenDiscussionRequest,
  OpenDiscussionResponse,
} from "../types/discussion.types";

const BOT_API_BASE = (
  import.meta.env.VITE_DISCUSSION_API_BASE_URL || "/bot-api"
)
  .toString()
  .replace(/\/+$/, "");

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

export async function openCaseDiscussion(
  caseItem: CaseItem
): Promise<OpenDiscussionResponse> {
  const payload = mapCaseItemToOpenDiscussionRequest(caseItem);

  let response: Response;
  try {
    response = await fetch(`${BOT_API_BASE}/discussions/open`, {
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

  let body: (OpenDiscussionResponse & BotApiErrorPayload) | null = null;
  try {
    body = (await response.json()) as OpenDiscussionResponse & BotApiErrorPayload;
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
      `Failed to open Telegram discussion (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return body;
}