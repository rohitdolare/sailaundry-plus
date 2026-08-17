import { Mars, Venus, Baby, Home, Shirt } from "lucide-react";

const RULES = [
  { test: /\b(men|man|gents?|boys?)\b/i, icon: Mars },
  { test: /\b(women|woman|ladies|lady|girls?)\b/i, icon: Venus },
  { test: /\b(kids?|child(ren)?|infants?|babies|baby)\b/i, icon: Baby },
  { test: /\b(household|home|linen|bedding|bedsheets?|curtains?)\b/i, icon: Home },
];

/** Best-guess lucide icon for a catalog section name, falling back to Shirt. */
export const getSectionIcon = (name) => {
  const match = RULES.find(({ test }) => test.test(name || ""));
  return match ? match.icon : Shirt;
};
