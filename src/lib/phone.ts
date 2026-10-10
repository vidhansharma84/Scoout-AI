// Canonical phone format: bare international digits, e.g. 233241234567.
// Local Ghana numbers (0XXXXXXXXX) get the 233 country code. Used both for
// storing users.phone and for sending SMS, so login and alerts agree.

export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("0")) d = "233" + d.slice(1);
  if (d.length < 9 || d.length > 15) return null;
  return d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Splits a "Phone / Email" field into whichever one it is.
export function parseIdentifier(
  raw: string,
): { email: string; phone: null } | { email: null; phone: string } | null {
  const v = raw.trim();
  if (v.includes("@")) {
    const email = v.toLowerCase();
    return EMAIL_RE.test(email) ? { email, phone: null } : null;
  }
  const phone = normalizePhone(v);
  return phone ? { email: null, phone } : null;
}
