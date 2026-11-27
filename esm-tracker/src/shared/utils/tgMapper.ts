export interface TgMapperRawEntry {
  phoneNumber?: string | number | null;
  name?: string | null;
  telegramId?: string | number | null;
  department?: string | null;
}

export interface TgMapperEntry {
  normalizedPhone: string;
  rawPhone: string;
  name: string;
  telegramId: string;
  department: string | null;
}

const mapperModules = import.meta.glob("/src/shared/esm_tg_mapper.json", {
  eager: true,
}) as Record<string, { default?: unknown } | unknown>;

export function normalizePhoneNumber(
  rawPhone?: string | number | null
): string | undefined {
  if (rawPhone === null || rawPhone === undefined) {
    return undefined;
  }

  let digits = String(rawPhone).replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("251") && digits.length >= 12) {
    digits = digits.slice(3);
  }

  digits = digits.replace(/^0+/, "");
  return digits.length >= 7 ? digits : undefined;
}

export function isValidPersonalTelegramId(
  raw?: string | number | null
): string | undefined {
  if (raw === null || raw === undefined) {
    return undefined;
  }
  const value = String(raw).trim();
  return /^\d{4,20}$/.test(value) ? value : undefined;
}

let cachedEntries: TgMapperEntry[] | null = null;

export function getTgMapperEntries(): TgMapperEntry[] {
  if (cachedEntries) {
    return cachedEntries;
  }

  const moduleEntry = Object.values(mapperModules)[0];
  const rawList =
    moduleEntry && typeof moduleEntry === "object" && "default" in moduleEntry
      ? moduleEntry.default
      : moduleEntry;

  if (!Array.isArray(rawList)) {
    cachedEntries = [];
    return cachedEntries;
  }

  const parsed: TgMapperEntry[] = [];
  for (const item of rawList as TgMapperRawEntry[]) {
    const normalizedPhone = normalizePhoneNumber(item?.phoneNumber);
    const telegramId = isValidPersonalTelegramId(item?.telegramId);
    if (!normalizedPhone || !telegramId) {
      continue;
    }

    parsed.push({
      normalizedPhone,
      rawPhone: String(item.phoneNumber).trim(),
      name:
        typeof item.name === "string" && item.name.trim()
          ? item.name.trim()
          : `Employee (${normalizedPhone})`,
      telegramId,
      department:
        typeof item.department === "string" ? item.department.trim() : null,
    });
  }

  cachedEntries = parsed;
  return cachedEntries;
}

export function findTelegramMappingByPhone(
  rawPhone?: string | number | null
): TgMapperEntry | undefined {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized) {
    return undefined;
  }

  return getTgMapperEntries().find(
    (entry) => entry.normalizedPhone === normalized
  );
}