let files = dv.current().file.inlinks
  .map(link => dv.page(link.path))
  .filter(p => p && p.tags && p.tags.includes("calendar/day"))
  .sort(p => p.created)
  .map(p => [
    dv.fileLink(p.file.path, false, p.created.toFormat("ccc")),
    `${isOccasion(p) ? "💫 " : ""}${p.HL ? p.HL : "\\-"}`
  ]);

dv.table(["Day", ""], files)

function isOccasion(page) {
  // if this page is part of an occasion
  const isPartOfOccasion = Array.from(page.file.inlinks)
    .map(link => dv.page(link.path))
    .filter(p => p && p.tags && !p.tags.includes("calendar/day"))
    .some(p => p.tags.some(t => t.includes("occasion")));
  const isOccasion = page.tags && page.tags.includes("occasion");
  return isOccasion || isPartOfOccasion;
}

