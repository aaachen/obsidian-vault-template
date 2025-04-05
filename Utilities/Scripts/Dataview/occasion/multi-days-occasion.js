const { Common, Log } = await cJS();
const dup = new Set();
let files = dv.current().file.outlinks
  .map(l => dv.page(l.path))
  .filter(p => {
    const date = p && p.created ? p.created.toFormat("yyyy-MM-dd") : "";
    const hasDup = dup.has(date)
    const isDay = p && p.tags && p.tags.includes("calendar/day");
    if (isDay) {
      dup.add(date);
    }
    return !hasDup && isDay;
  })
  .sort(p => p.created);

files = Array.from(files);

let rows = files.map(p => [
  dv.fileLink(p.file.path, false, p.created.toFormat("MMM dd")),
  p.HL
]);


const table = dv.markdownTable(["Day", ""], rows)
dv.paragraph(`>[!log]- Days\n` + Common.wrapInQuoteBlock(table))

if (!files.length) {
  return;
}

const year = Common.extractYear(dv.current().file.path);
if (!year) {
  console.error(
    "Cannot find year information from current file path",
    dv.current().file.path
  )
  throw Error("Cannot find year information from current file path");
}

// Convention: this year's journal is named "Journal Log", and past years are prefixed with year
// i.e. "2024 - Journal Log"
let journalLogName = "Journal Log";
if (year !== new Date().getFullYear()) {
  journalLogName = `${year} - ${journalLogName}`
}

const logContent = await Log.getLogContent(dv, journalLogName);
const startDate = files[0].created;
const endDate = files[files.length - 1].created;
let logCallout = Log.getLogContentBetweenDates(logContent, endDate, startDate)
if (logCallout) {
  logCallout = `>[!book]- Journal\n` + Common.wrapInQuoteBlock(logCallout);
}
dv.paragraph(logCallout);

