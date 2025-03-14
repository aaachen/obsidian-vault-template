// Digest of milestones for a year
const { Milestone } = await cJS()
const effortPages = dv.pages('#effort').values
const year = input.year ?? moment().year();
const efforts = effortPages
    .map(e => getEffortsInYear(e, year))
    .filter(e => e.milestones.length)
const totalMilestones = efforts.reduce((acc, e) => acc + e.milestones.length, 0)
const perEffortLines = efforts.map(e => {
    return `- **${e.milestones.length}** in [[${e.name}]], last in *${e.milestones[e.milestones.length - 1].milestoneName}*`
}).join('\n')

dv.paragraph(`
This year, I crossed **${totalMilestones}** stepping stones 
${perEffortLines}
`);

function getEffortsInYear(effortPage, year) {
    const milestones = Milestone.getMilestones(effortPage).filter(m =>
        m.accomplished && m.accomplished.year == year
    )
    // sort by the accomplished date
    milestones.sort((a, b) => a.accomplished.valueOf() - b.accomplished.valueOf())
    return {
        name: effortPage.file.name,
        milestones: milestones
    }
}

