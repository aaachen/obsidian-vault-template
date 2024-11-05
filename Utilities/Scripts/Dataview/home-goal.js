function inXDays(x) {
    return `In ${x} ${x > 1 ? "days" : "day"}`
}

// TODO: Use Goal component
// Read
let rpage = dv.page('Atlas/+ Maps/📖 Read');
let rProgressEl = dv.el("progress", "", { attr: { value: rpage.progress, max: rpage.target} })
let rTargetDate = rpage.targetDate.toISODate();

// Gain Weight
let yearPath = "Calendar/Notes/This Year";

let weekNum = Number(moment().format("ww"));
let wpage = dv.page('Atlas/+ Maps/🍔 Gain Weight');
let latestWeek = undefined;
let i = 0;
while (weekNum - i > 0) {
  latestWeek = dv.page(`${yearPath}/${moment().subtract(7 * i, 'd').format("YYYY-MM-[w]ww")}`);
  if (latestWeek && latestWeek.weight) break;
  i++;
}

let currW = latestWeek.weight ? latestWeek.weight : 130;
let wProgress = wpage.targetGain - (wpage.target - currW);
let wProgressEl = dv.el("progress", "", { attr: { value: wProgress, max: wpage.targetGain} })
let wTargetDate = wpage.targetDate.toISODate();

// Render

dv.table(["Goal", "Target", "Progress"],
    [
      [
          `<span>[[🍔 Gain Weight|Gain 10 Pounds]]</span>`,
          inXDays(moment(wTargetDate).diff(moment(), 'days')),
          wProgressEl
      ],
      [
          `<span>[[📖 Read|Read 15 Books]]</span>`,
          inXDays(moment(rTargetDate).diff(moment(), 'days')),
          rProgressEl
      ]
    ]
);

//`<progress value="${dexercised}" max="dexercisePerWeekTarget"></progress><br>${Math.round((dexercised / dexercisePerWeekTarget) * 100)}% completed`

