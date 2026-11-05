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
 * Save a customer to the device's contacts: share sheet on mobile, .vcf download elsewhere.
 * @returns {Promise<boolean>} false when the mobile number is invalid
 */
export const saveContact = async (customer) => {
  const address = customer?.address || customer?.locations?.[0]?.address || "";
  const vcf = buildVCard({ name: customer?.name, mobile: customer?.mobile || customer?.phone, address });
  if (!vcf) return false;

  const name = fileName(customer?.name);
  const blob = new Blob([vcf], { type: "text/vcard" });

  try {
    const file = new File([blob], name, { type: "text/vcard" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: customer?.name || "Contact" });
      return true;
    }
  } catch (err) {
    if (err?.name === "AbortError") return true; // user cancelled share sheet
    // otherwise fall through to download
  }

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
