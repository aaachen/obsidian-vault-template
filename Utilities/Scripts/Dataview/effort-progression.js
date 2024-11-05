const { Common } = await cJS();

// effort name may have emojis and mermaid engine doesn't seem to like those as ids
// since there'd only be a small, finite amount of efforts, using subset of hash, the chance of collision would be small
const getId = async (effortName) => {
  return await Common.sha256(effortName, 16);
};

// mermaid doesn't like :
const sanitize = (str) => {
  return str ? str.replace(/:/g, " - ") : "";
};

// TODO: refactor this method into CommonJS (used by weekly milestone dashboard)
const getMilestones = (p) => {
  const milestones = Common.toArray(p.milestone) ?? [];
  const targets = Common.toArray(p.target) ?? new Array(milestones.length);
  const descs = Common.toArray(p.desc) ?? new Array(milestones.length);
  const accomplished =
    Common.toArray(p.accomplished) ?? new Array(milestones.length);

  return targets.map((_, i) => ({
    effort: p.file.name,
    milestoneName: milestones[i],
    desc: descs[i],
    target: targets[i],
    accomplished: accomplished[i],
  }));
};

const getWeeklyEffortSummaries = (p) => {
  const weekName = p.file.name;
  const effortName = Common.toArray(p["Effort Name"]) ?? [];
  const effortSummary =
    Common.toArray(p["Effort Summary"]) ?? new Array(effortName.length);
  const daysWorked =
    Common.toArray(p["Days Worked"]) ?? new Array(effortName.length);

  return effortName.map((_, i) => ({
    weekName: weekName,
    effort: effortName[i],
    summary: effortSummary[i],
    daysWorked: daysWorked[i],
  }));
};

// TODO: start here
const years = input.years;
const startingYear = !years ? moment().year() : Math.min(...years);
const yearPathPrefixes = !years
  ? []
  : years.map((year) =>
      year == moment().year()
        ? "Calendar/Notes/This Year"
        : `Calendar/Notes/Past Years/${year}`
    );
const effortPage = dv.current();
const effortName = effortPage.file.name;
if (!effortPage.tags || !effortPage.tags.includes("effort")) {
  throw new Error("Not in an effort page");
}
const weekPages = dv.pages(`#calendar/week`).where((p) => {
  if (years) {
    return yearPathPrefixes.some((prefix) => p.file.path.startsWith(prefix));
  } else {
    return true;
  }
}).values;
// each effort is a section in gantt chart
// each line is a week accomplishment of effort section
// { weekName: x, effort: effort, summary: y, id: z, daysWorked: d, milestones: m }
const effortSummaries = [];
const week2Milestones = new Map();

// Step 1: populate milestones of current effort
getMilestones(effortPage).forEach((m) => {
  // no need to include not yet accomplished milestones
  if (!m.accomplished) {
    return;
  }
  let weekName = m.accomplished.toFormat("yyyy-wWW");
  let milestones = week2Milestones.get(weekName);
  if (!milestones) {
    milestones = [];
    week2Milestones.set(weekName, milestones);
  }
  milestones.push(m);
});

// Step 2: populate accomplishments from past weeks
weekPages.forEach((wp) => {
  let weekEffortSummaries = getWeeklyEffortSummaries(wp).filter(
    (es) => es.effort == effortName
  );
  effortSummaries.push(...weekEffortSummaries);
});
// sort in place by date
effortSummaries.sort((a, b) => a.weekName.localeCompare(b.weekName));

// Step 3: join week milestones and accomplishments
let sections = [];
let prevWeekName = "";
let i = 0;
console.log(effortSummaries);
for (let acc of effortSummaries) {
  let section = [];
  let effortPrefix = effortName.replace(/\s+/g, "-");
  // add the accomplishments of effort completed for each week
  let fullWeekName = acc.weekName;
  let weekName = `${fullWeekName.substring(fullWeekName.length - 3)}`;
  let monthWeekName = `${fullWeekName.substring(fullWeekName.length - 6)}`;
  let id = await getId(`${effortPrefix}-${weekName}`);
  let prevId = await getId(`${effortPrefix}-${prevWeekName}`);
  prevWeekName = weekName;
  let time = i == 0 ? `${startingYear}-01-01` : `after ${prevId}`;
  let line = `(${monthWeekName}) ${sanitize(acc.summary)} :${id}, ${time}, ${
    acc.daysWorked
  }d`;
  section.push(line);

  // add the milestones of that effort after the accomplishment
  const year = fullWeekName.split("-")[0];
  let milestones = week2Milestones.get(`${year}-${weekName}`);
  if (milestones) {
    for (let m of milestones) {
      if (m.effort == effortName) {
        let id = await getId(`${effortPrefix}-${weekName}`);
        let line = `${sanitize(m.milestoneName)} - ${sanitize(
          m.desc
        )}: milestone, after ${id},`;
        section.push(line);
      }
    }
  }
  sections.push(section.join("\n"));
  i++;
}

if (sections.length == 0) {
  sections.push(
    `section Undefined`,
    `No efforts accomplishments logged in past weeks:tmp, ${startingYear}-01-01, 0d`
  );
}

// TODO: theme get current theme setting and set the theme here
dv.paragraph(`
\`\`\`mermaid
%%{init: {'theme':'dark'}}%%
gantt
tickInterval 1week
weekday monday
title ${effortName} - Effort Progression
dateFormat YYYY-MM-DD
axisFormat %Y-%m-%d

${sections.join("\n")}
\`\`\`
`);
