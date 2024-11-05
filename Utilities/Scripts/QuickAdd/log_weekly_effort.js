module.exports = {
  entry: start,
  settings: {
    name: "Log Weekly Effort Summary",
    author: "Andrew Chen",
    options: {},
  },
};

let QuickAdd;
let Settings;

function wrapDV(k, v) {
  return `[${k}::${v}]`;
}

const effortFieldPrefix = "effort";
const accomplishFieldPrefix = "effortAccoms";
const summaryFieldPrefix = "summary";

async function start(params, settings) {
  QuickAdd = params;
  Settings = settings;

  const currentFile = app.workspace.getActiveFile();
  const dv = app.plugins.plugins["dataview"].api;
  const page = dv.page(`${currentFile.path}`);
  let inlinks = page.file.inlinks.values.map((l) => dv.page(l.path));
  let days = inlinks.filter(
    (p) =>
      Array.isArray(p.tags) &&
      p.tags.some((tag) => tag.includes("calendar/day"))
  );

  let efforts = new Map();
  let daysEnames = days.map((d) => {
    let ename = d.ename ?? [];
    return Array.isArray(ename) ? ename : [ename];
  });
  daysEnames.forEach((enames, i) => {
    let day = days[i];
    let desc = Array.isArray(day.desc) ? day.desc : [day.desc];
    enames.forEach((ename, j) => {
      let accomplishment = desc[j];
      if (!efforts.has(ename)) {
        efforts.set(ename, [accomplishment]);
      } else {
        let accomplishments = efforts.get(ename);
        accomplishments.push(accomplishment);
      }
    });
  });
  const modalForm = app.plugins.plugins.modalforms.api;
  let effortNames = Array.from(efforts.keys());
  const result = await modalForm.openForm(getWeeklyLogSummaryForm(efforts));
  let snippet = "";
  effortNames.forEach((_, i) => {
    let effortName = effortNames[i];
    let daysWorkedOnEffort = efforts.get(effortName).length;
    // Map in js preserves insertion order so form and map index will match up
    let accomplishmentSummary = result.get(`${summaryFieldPrefix}${i}`);
    snippet +=
      "- " +
      wrapDV("Effort Name", effortName) +
      ", " +
      wrapDV("Effort Summary", accomplishmentSummary) +
      ", " +
      wrapDV("Days Worked", daysWorkedOnEffort) +
      "\n";
  });

  /* 
  // Additional search queries of efforts, removed to de-clutter page, need to embed a JSON like this in page
  // weekdates::["<%tp.date.weekday("YYYY-MM-DD", 0)%>", "<%tp.date.weekday("YYYY-MM-DD", 1)%>", "<%tp.date.weekday("YYYY-MM-DD", 2)%>", "<%tp.date.weekday("YYYY-MM-DD", 3)%>", "<%tp.date.weekday("YYYY-MM-DD", 4)%>", "<%tp.date.weekday("YYYY-MM-DD", 5)%>", "<%tp.date.weekday("YYYY-MM-DD", 6)%>"]
  let dates = page.weekdates;
  if (dates) {
    dates = JSON.parse(dates);
    effortNames.forEach((effortName) => {
      snippet += `#### [[${effortName}]]
\`\`\`query
"${effortName}" (${dates.map(d => "file: " + d).join(" OR ")})
\`\`\`
`;
    });
  }
  */

  QuickAdd.variables = {
    snippet: snippet,
  };
}

/**
 * Populate a form that looks like
 *
 * effort1: effort name
 * accomplish1: all accomplishments of effort this week
 * summary1: high level weekly summary
 *
 * effort2: ...
 * ...
 */
function getWeeklyLogSummaryForm(efforts) {
  // fields
  let fields = [];
  Array.from(efforts.entries()).forEach(([effort, accomplishments], i) => {
    let accomplishedHtml = accomplishments.map((a) => `<li>${a}</li>`).join("");
    fields.push(
      {
        name: `${effortFieldPrefix}${i}`,
        label: `${effort}`,
        description: "",
        input: {
          type: "document_block",
          allowUnknownValues: false,
          body: `return ""`,
        },
        isRequired: false,
      },
      {
        name: `${accomplishFieldPrefix}${i}`,
        label: "Accomplishments",
        description: "",
        input: {
          type: "document_block",
          allowUnknownValues: false,
          body: `return "<ul>${accomplishedHtml}</ul>"`,
        },
        isRequired: false,
      },
      {
        name: `${summaryFieldPrefix}${i}`,
        label: "Summary",
        description: "Summarize accomplishment this week",
        isRequired: true,
        input: {
          type: "text",
        },
      }
    );
  });

  let form = {
    title: "Weekly accomplishments",
    fields: fields,
  };
  return form;
}
