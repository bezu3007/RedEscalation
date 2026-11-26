import type { OpenDiscussionResponse } from "../types/discussion.types";

export interface TelegramLaunchTarget {
  primaryUrl?: string;
  primaryLabel: string;
  topicUrl?: string;
  botUrl?: string;
  needsBotInviteFirst: boolean;
  autoLaunchAttempted?: boolean;
}

export function isSafeTelegramUrl(url?: string | null): url is string {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "t.me" || parsed.hostname === "telegram.me")
    );
  } catch {
    return false;
  }
}

export function buildTelegramTopicUrl(
  groupId?: string,
  messageThreadId?: number
): string | undefined {
  if (!groupId || !messageThreadId || !Number.isInteger(messageThreadId) || messageThreadId <= 0) {
    return undefined;
  }

  const normalizedGroupId = groupId.trim();
  if (/^-100\d+$/.test(normalizedGroupId)) {
    return `https://t.me/c/${normalizedGroupId.slice(4)}/${messageThreadId}`;
  }

  return undefined;
}

export function resolveTelegramDestination(
  response: OpenDiscussionResponse,
  currentEmployeeId?: string | number | null
): TelegramLaunchTarget {
  const topicUrl = isSafeTelegramUrl(response.topicUrl)
    ? response.topicUrl
    : buildTelegramTopicUrl(response.groupId, response.messageThreadId);

  const botUrl = isSafeTelegramUrl(response.botUrl) ? response.botUrl : undefined;

  const normalizedEmployeeId =
    currentEmployeeId !== null && currentEmployeeId !== undefined
      ? String(currentEmployeeId).trim().toUpperCase()
      : "";

  const myParticipant =
    normalizedEmployeeId && response.participants
      ? response.participants.find(
          (p) => p.employeeId.trim().toUpperCase() === normalizedEmployeeId
        )
      : undefined;

  const needsBotInviteFirst = Boolean(
    myParticipant &&
      (myParticipant.action === "REQUIRES_BOT_START" ||
        myParticipant.action === "INVITED" ||
        myParticipant.action === "INVITE_REUSED")
  );

  if (needsBotInviteFirst && botUrl) {
    return {
      primaryUrl: botUrl,
      primaryLabel:
        myParticipant?.action === "REQUIRES_BOT_START"
          ? "Start Bot in Telegram"
          : "Open Invite in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst: true,
    };
  }

  if (topicUrl) {
    return {
      primaryUrl: topicUrl,
      primaryLabel: "Open Topic in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst: false,
    };
  }

  if (botUrl) {
    return {
      primaryUrl: botUrl,
      primaryLabel: "Open Bot in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst,
    };
  }

  return {
    primaryLabel: "Open in Telegram",
    needsBotInviteFirst,
  };
}

export function launchTelegramUrl(url?: string): boolean {
  if (!isSafeTelegramUrl(url) || typeof document === "undefined") {
    return false;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}