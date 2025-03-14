const { Common, Milestone } = await cJS();

const getReached = (accomplished, target) => {
  if (!accomplished) return "";
  return accomplished.startOf("day") <= target ? "✅" : "";
};

const pages = dv.pages('#effort').where((p) => {
  return p.milestone && p.target;
});

const beginning = dv.date(`${input.start}`).startOf("day");
const end = dv.date(`${input.end}`).startOf("day");

const milestoneInDays = [];
const milestoneRollover = [];
pages.forEach((p) => {
  let milestones = Milestone.getMilestones(p);

  milestones.forEach((milestone) => {
    // Targeted for this month
    if (
      milestone.target &&
      milestone.target.startOf("day") >= beginning &&
      milestone.target.startOf("day") <= end
    ) {
      milestoneInDays.push([
        p.file.link,
        milestone.milestoneName,
        milestone.desc,
        milestone.target,
        getReached(milestone.accomplished, end),
      ]);
    }
    // Rollover (targeted in the past & not accomplished or accomplished this month)
    if (
      milestone.target &&
      milestone.target.startOf("day") < beginning &&
      (!milestone.accomplished || milestone.accomplished.startOf("day") >= beginning)
    ) {
      milestoneRollover.push([
        p.file.link,
        milestone.milestoneName,
        milestone.desc,
        milestone.target,
        getReached(milestone.accomplished, end),
      ]);
    }
  });
});

dv.table(
  ["Effort", "Milestone", "Description", "Target", "Reached"],
  [...milestoneInDays, ...milestoneRollover]
);
