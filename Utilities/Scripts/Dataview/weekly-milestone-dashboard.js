const { Common } = await cJS();

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

const getReached = (accomplished, target) => {
  if (!accomplished) return "";
  return accomplished.startOf("day") <= target ? "✅" : "";
};

const pages = dv.pages('"Efforts" and #effort').where((p) => {
  return p.milestone && p.target;
});

const monday = dv.date(`${input.startOfWeekDate}`).startOf("day");
const sun = dv.date(`${input.endOfWeekDate}`).startOf("day");

const milestoneThisWeek = [];
pages.forEach((p) => {
  let milestones = getMilestones(p);

  milestones.forEach((milestone) => {
    if (
      milestone.target &&
      milestone.target.startOf("day") >= monday &&
      milestone.target.startOf("day") <= sun
    ) {
      milestoneThisWeek.push([
        p.file.link,
        milestone.milestoneName,
        milestone.desc,
        milestone.target.toFormat("cccc"),
        getReached(milestone.accomplished, sun),
      ]);
    }
  });
});

const milestoneRollover = [];
pages.forEach((p) => {
  let milestones = getMilestones(p);

  milestones.forEach((milestone) => {
    if (
      milestone.target &&
      milestone.target.startOf("day") < monday &&
      (!milestone.accomplished || milestone.accomplished.startOf("day") >= monday)
    ) {
      milestoneRollover.push([
        p.file.link,
        milestone.milestoneName,
        milestone.desc,
        milestone.target.toFormat("yyyy-LL-dd"),
        getReached(milestone.accomplished, sun),
      ]);
    }
  });
});

dv.table(
  ["Effort", "Milestone", "Description", "Target", "Reached"],
  [...milestoneThisWeek, ...milestoneRollover]
);
