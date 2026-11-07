export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("995") ? digits.slice(3) : digits;
}