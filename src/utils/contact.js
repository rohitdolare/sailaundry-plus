import { toWhatsAppNumber } from "./phone";

const esc = (v) =>
  String(v ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

/**
 * Build a vCard 3.0 string for a customer, or null if the mobile is invalid.
 * Opening a .vcf on iOS/Android shows the native "Add contact" screen.
 */
export const buildVCard = ({ name, mobile, address } = {}) => {
  const wa = toWhatsAppNumber(mobile);
  if (!wa) return null;
  const fullName = (name || "").trim() || `+${wa}`;
  const parts = fullName.split(/\s+/);
  const first = parts[0] || "";
  const last = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(fullName)}`,
    `N:${esc(last)};${esc(first)};;;`,
    `TEL;TYPE=CELL:+${wa}`,
  ];
  if (address && String(address).trim()) lines.push(`ADR;TYPE=HOME:;;${esc(String(address).trim())};;;;`);
  lines.push("NOTE:Sai Laundry+ customer", "END:VCARD");
  return lines.join("\r\n") + "\r\n";
};

const fileName = (name) => `${(name || "contact").trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_") || "contact"}.vcf`;

/**
 * Android Chrome "intent:" URL that opens the native Contacts "Create contact"
 * screen pre-filled (ContactsContract.Intents.Insert extras). Null if mobile invalid.
 */
export const buildAndroidContactIntent = ({ name, mobile, address } = {}) => {
  const wa = toWhatsAppNumber(mobile);
  if (!wa) return null;
  const enc = (v) => encodeURIComponent(String(v));
  const parts = [
    "intent:#Intent",
    "action=android.intent.action.INSERT",
    "type=vnd.android.cursor.dir/contact",
  ];
  const fullName = (name || "").trim();
  if (fullName) parts.push(`S.name=${enc(fullName)}`);
  parts.push(`S.phone=${enc(`+${wa}`)}`, "i.phone_type=2"); // 2 = mobile
  if (address && String(address).trim()) parts.push(`S.postal=${enc(String(address).trim())}`);
  parts.push("end");
  return parts.join(";");
};

export const getPlatform = (ua = typeof navigator !== "undefined" ? navigator.userAgent : "") => {
  if (/android/i.test(ua)) return "android";
  // iPadOS 13+ reports as Mac; detect via touch support.
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1) return "ios";
  return "desktop";
};

/**
 * Save a customer to the device's contacts.
 * - Android: opens the Contacts app's "Create contact" screen directly.
 * - iOS: opens the vCard in-page so Safari shows "Create New Contact".
 * - Desktop: downloads a .vcf file.
 * @returns {Promise<boolean>} false when the mobile number is invalid
 */
export const saveContact = async (customer) => {
  const address = customer?.address || customer?.locations?.[0]?.address || "";
  const details = { name: customer?.name, mobile: customer?.mobile || customer?.phone, address };
  const vcf = buildVCard(details);
  if (!vcf) return false;

  const platform = getPlatform();

  if (platform === "android") {
    window.location.href = buildAndroidContactIntent(details);
    return true;
  }

  if (platform === "ios") {
    // Navigating to a vCard (no download attribute) makes iOS show the contact card.
    window.location.href = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`;
    return true;
  }

  const name = fileName(customer?.name);
  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
