/** Builds a display label like "Table 5" from the `table` query value. */
export function tableLabelFromSearchParam(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  return `Table ${t}`;
}
