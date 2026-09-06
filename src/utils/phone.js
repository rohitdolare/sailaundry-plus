// Normalizes a stored mobile number (bare 10 digits, sometimes with a
// leading 0 or an accidental country code) into the digits-only,
// no-plus format wa.me expects: "91XXXXXXXXXX".
export const toWhatsAppNumber = (mobile) => {
  const digits = String(mobile || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return null; // invalid/missing number
  return `91${last10}`;
};
