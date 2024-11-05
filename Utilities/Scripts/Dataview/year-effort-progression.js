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

const year = input.year;
const path =
  year == moment().year()
    ? "Calendar/Notes/This Year"
    : `Calendar/Notes/Past Years/${year}`;
const effortPages = dv.pages('"Efforts" and #effort').values;
const weekPages = dv.pages(`"${path}" and #calendar/week`).values;
// each effort is a section in gantt chart
// each line is a week accomplishment of effort section
// { weekName: x, effort: effort, summary: y, id: z, daysWorked: d, milestones: m }
const effort2Accomplishment = new Map();
const week2Milestones = new Map();

// Step 1: populate effort2Milestones
effortPages.forEach((e) => {
  getMilestones(e).forEach((m) => {
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
});

// Step 2: iterate through weeks and populate effort2Accomplishment
weekPages.forEach((wp) => {
  let weekEffortSummaries = getWeeklyEffortSummaries(wp);
  // for each effort and their summary
  weekEffortSummaries.forEach((effortSummary) => {
    let weekAccomplishments = effort2Accomplishment.get(effortSummary.effort);
    if (!weekAccomplishments) {
      weekAccomplishments = [];
      effort2Accomplishment.set(effortSummary.effort, weekAccomplishments);
    }
    weekAccomplishments.push(effortSummary);
  });
});
// sort in place by date
Array.from(effort2Accomplishment.values()).forEach((wes) =>
  wes.sort((a, b) => a.weekName.localeCompare(b.weekName))
);

// Step 3: join week milestones and accomplishments
let sections = [];
for (let [effortName, accomplishments] of effort2Accomplishment) {
  let section = [`section ${effortName}`];
  let effortPrefix = effortName.replace(/\s+/g, "-");
  let prevWeekName = "";
  // add the accomplishments of effort completed for each week
  let i = 0;
  for (let acc of accomplishments) {
    let weekName = `${acc.weekName.substring(acc.weekName.length - 3)}`;
    let monthWeekName = `${acc.weekName.substring(acc.weekName.length - 6)}`;
    let id = await getId(`${effortPrefix}-${weekName}`);
    let prevId = await getId(`${effortPrefix}-${prevWeekName}`);
    prevWeekName = weekName;
    let time = i == 0 ? `${year}-01-01` : `after ${prevId}`;
    let line = `(${monthWeekName}) ${sanitize(acc.summary)} :${id}, ${time}, ${
      acc.daysWorked
    }d`;
    section.push(line);

    // add the milestones of that effort after the accomplishment
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
    i++;
  }
  sections.push(section.join("\n"));
}

if (sections.length == 0) {
  sections.push(
    `section Undefined`,
    `No efforts logged for the year of ${year}:tmp, ${year}-01-01, 0d`
  );
}

// TODO: theme get current theme setting and set the theme here
dv.paragraph(`
\`\`\`mermaid
%%{init: {'theme':'dark'}}%%
gantt
tickInterval 1week
weekday monday
title ${year} - Effort Progression
dateFormat YYYY-MM-DD
axisFormat %Y-%m-%d

${sections.join("\n")}
\`\`\`
`);
