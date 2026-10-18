/** Parse Question.optionsJson supporting legacy string[] and bilingual {en,ar}. */

export type ParsedOptions = {
  options: string[];
  optionsAr: string[] | null;
};

export function parseQuestionOptions(optionsJson: string): ParsedOptions {
  const raw = JSON.parse(optionsJson) as unknown;
  if (Array.isArray(raw)) {
    return { options: raw.map(String), optionsAr: null };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as { en?: unknown; ar?: unknown; options?: unknown };
    const en = Array.isArray(obj.en)
      ? obj.en.map(String)
      : Array.isArray(obj.options)
        ? obj.options.map(String)
        : [];
    const ar = Array.isArray(obj.ar) ? obj.ar.map(String) : null;
    return { options: en, optionsAr: ar && ar.length === en.length ? ar : null };
  }
  return { options: [], optionsAr: null };
}

export function serializeQuestionOptions(options: string[], optionsAr?: string[] | null): string {
  if (optionsAr && optionsAr.length === options.length) {
    return JSON.stringify({ en: options, ar: optionsAr });
  }
  return JSON.stringify(options);
}
