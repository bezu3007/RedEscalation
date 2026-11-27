import { normalizePhoneNumber } from "@/shared/utils/tgMapper";
import type { OpenDiscussionResponse } from "../types/discussion.types";

export interface TelegramLaunchTarget {
  primaryUrl?: string;
  primaryLabel: string;
  topicUrl?: string;
  botUrl?: string;
  needsBotInviteFirst: boolean;
  shouldAutoLaunch?: boolean;
  unmappedSelf?: boolean;
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
  if (
    !groupId ||
    !messageThreadId ||
    !Number.isInteger(messageThreadId) ||
    messageThreadId <= 0
  ) {
    return undefined;
  }

  const normalizedGroupId = groupId.trim();
  if (/^-100\d+$/.test(normalizedGroupId)) {
    return `https://t.me/c/${normalizedGroupId.slice(4)}/${messageThreadId}`;
  }

  return undefined;
}

function appendBotStartParam(botUrl: string, startParam: string): string {
  try {
    const parsed = new URL(botUrl);
    if (!parsed.searchParams.has("start")) {
      parsed.searchParams.set("start", startParam);
    }
    return parsed.toString();
  } catch {
    return botUrl;
  }
}

export function resolveTelegramDestination(
  response: OpenDiscussionResponse,
  currentEmployeeId?: string | number | null,
  currentPhoneNumber?: string | null,
  currentTelegramId?: string | null
): TelegramLaunchTarget {
  const topicUrl = isSafeTelegramUrl(response.topicUrl)
    ? response.topicUrl
    : buildTelegramTopicUrl(response.groupId, response.messageThreadId);

  const botUrl = isSafeTelegramUrl(response.botUrl) ? response.botUrl : undefined;
  const botStartUrl = botUrl ? appendBotStartParam(botUrl, "join") : undefined;

  const normalizedEmployeeId =
    currentEmployeeId !== null && currentEmployeeId !== undefined
      ? String(currentEmployeeId).trim().toUpperCase()
      : "";
  const normalizedPhone = normalizePhoneNumber(currentPhoneNumber);
  const phoneKey = normalizedPhone ? `PHONE:${normalizedPhone}` : "";
  const cleanTelegramId = currentTelegramId?.trim() || "";
  const tgKey = cleanTelegramId ? `TG:${cleanTelegramId}` : "";

  const myParticipant =
    response.participants?.find(
      (p) => cleanTelegramId && p.telegramId?.trim() === cleanTelegramId
    ) ??
    response.participants?.find((p) => {
      const pId = p.employeeId.trim().toUpperCase();
      const pTg = p.telegramId?.trim() || "";
      if (cleanTelegramId && pTg && pTg !== cleanTelegramId) {
        return false;
      }
      return (
        (normalizedEmployeeId && pId === normalizedEmployeeId) ||
        (phoneKey && pId === phoneKey) ||
        (tgKey && pId === tgKey)
      );
    });

  if (myParticipant?.action === "ALREADY_MEMBER" && topicUrl) {
    return {
      primaryUrl: topicUrl,
      primaryLabel: "Open Topic in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst: false,
      shouldAutoLaunch: true,
    };
  }

  if (myParticipant?.action === "REQUIRES_BOT_START") {
    const targetBotUrl = botStartUrl ?? botUrl;
    return {
      primaryUrl: targetBotUrl,
      primaryLabel: "Start Bot & Request to Join",
      topicUrl,
      botUrl: targetBotUrl,
      needsBotInviteFirst: true,
      shouldAutoLaunch: Boolean(targetBotUrl),
    };
  }

  if (
    myParticipant?.action === "INVITED" ||
    myParticipant?.action === "INVITE_REUSED"
  ) {
    return {
      primaryUrl: botUrl,
      primaryLabel: "Open Invite in Telegram Bot",
      topicUrl,
      botUrl,
      needsBotInviteFirst: true,
      shouldAutoLaunch: Boolean(botUrl),
    };
  }

  if (
    myParticipant?.action === "UNMAPPED_TELEGRAM_ID" ||
    myParticipant?.action === "CHECK_FAILED" ||
    !myParticipant
  ) {
    return {
      primaryUrl: botStartUrl ?? botUrl,
      primaryLabel: "Open Bot in Telegram",
      topicUrl,
      botUrl: botStartUrl ?? botUrl,
      needsBotInviteFirst: true,
      shouldAutoLaunch: false,
      unmappedSelf: !myParticipant || myParticipant.action === "UNMAPPED_TELEGRAM_ID",
    };
  }

  if (topicUrl) {
    return {
      primaryUrl: topicUrl,
      primaryLabel: "Open Topic in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst: false,
      shouldAutoLaunch: true,
    };
  }

  if (botUrl) {
    return {
      primaryUrl: botUrl,
      primaryLabel: "Open Bot in Telegram",
      topicUrl,
      botUrl,
      needsBotInviteFirst: true,
      shouldAutoLaunch: true,
    };
  }

  return {
    primaryLabel: "Open in Telegram",
    needsBotInviteFirst: false,
    shouldAutoLaunch: false,
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