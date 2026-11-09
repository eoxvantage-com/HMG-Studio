export const ACCOUNT_PREFERENCES_FUNCTION = "hmg-account-preferences-v1";
export const FUNCTION_META = { kind: "function", async: false } as const;
export const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD-MMM-YYYY"] as const;
export const PREFERENCE_FIELDS = ["date_format", "time_format", "timezone"] as const;
export type AccountPreferences = Record<typeof PREFERENCE_FIELDS[number], string>;

const messages: Record<string, string> = {
  UNAUTHENTICATED: "Your session is unavailable. Sign in again.",
  VALIDATION_ERROR: "Check the date format, time format and IANA timezone.",
  UPDATE_FAILED: "Preferences were not saved. Check your access and try again.",
  UPDATE_UNCONFIRMED: "Save could not be confirmed. Reload preferences before trying again.",
  READBACK_FAILED: "Save could not be verified. Reload preferences before trying again.",
  LOAD_FAILED: "Unable to load account preferences. Try again.",
};

export class PreferencesError extends Error {
  constructor(public code: string, public fields: Partial<AccountPreferences> = {}) {
    super(messages[code] ?? "Unexpected preferences response. Reload preferences.");
  }
}

export function decodePreferences(value: unknown): AccountPreferences {
  if (!value || typeof value !== "object") throw new PreferencesError("INVALID_RESPONSE");
  const response = value as Record<string, unknown>;
  if (response.ok !== true || response.verified !== true) {
    const code = typeof response.code === "string" ? response.code : "INVALID_RESPONSE";
    const fields: Partial<AccountPreferences> = {};
    if (code === "VALIDATION_ERROR" && response.errors && typeof response.errors === "object") {
      for (const field of PREFERENCE_FIELDS) {
        if (field in response.errors) fields[field] = field === "timezone"
          ? "Enter a valid IANA timezone, such as Asia/Kolkata."
          : "Choose a supported format.";
      }
    }
    throw new PreferencesError(code, fields);
  }
  const prefs = response.preferences as Record<string, unknown> | undefined;
  if (!prefs || PREFERENCE_FIELDS.some((key) => typeof prefs[key] !== "string" || !prefs[key])) {
    throw new PreferencesError("INVALID_RESPONSE");
  }
  return { date_format: prefs.date_format as string, time_format: prefs.time_format as string, timezone: prefs.timezone as string };
}

export function preferenceChanges(before: AccountPreferences, after: AccountPreferences): Partial<AccountPreferences> {
  const changes: Partial<AccountPreferences> = {};
  for (const field of PREFERENCE_FIELDS) if (before[field] !== after[field]) changes[field] = after[field];
  return changes;
}
