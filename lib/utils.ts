export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function normalizeText(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function includesAny(value: string | undefined, candidates: string[]) {
  const text = normalizeText(value);
  return candidates.some((candidate) => text.includes(normalizeText(candidate)));
}
