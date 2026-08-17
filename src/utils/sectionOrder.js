const PRIORITY_RULES = [
  /\b(men|man|gents?|boys?)\b/i,
  /\b(women|woman|ladies|lady|girls?)\b/i,
  /\b(kids?|child(ren)?|infants?|babies|baby)\b/i,
];

const rankOf = (section) => {
  const idx = PRIORITY_RULES.findIndex((test) => test.test(section?.name || ""));
  return idx === -1 ? PRIORITY_RULES.length : idx;
};

/** Sorts catalog sections Men → Women → Kids (most-ordered first), other sections keep their relative order after. */
export const sortSectionsByUsage = (sections) =>
  [...(sections || [])].sort((a, b) => rankOf(a) - rankOf(b));
