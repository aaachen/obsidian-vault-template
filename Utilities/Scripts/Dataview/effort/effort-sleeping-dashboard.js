const { Milestone } = await cJS();

let effortPages = dv.pages(`#effort`)
    .where(p => !p.file.path.includes("Utilities") && p.intensity == "Sleeping 💤")
    .values;

let rows = effortPages.map(p => {
    const fileLink = p.file.link;
    // complete, last milestone date, last modified date
    let date;
    if (p.completed) {
        date = p.completed;
    } else if (p.milestone) {
        const milestones = Milestone.getMilestones(p);
        milestones.sort(sortFn("accomplished"));
        date = milestones.pop().accomplished;
    }
    return [fileLink, date];
});

rows.sort(sortFn(1));

dv.table(
    ["", "Completed"],
    [...rows]
);

function sortFn(name) {
    return (a, b) => {
        if (a[name] === undefined && b[name] === undefined) return 0;
        if (a[name] === undefined) return 1;
        if (b[name] === undefined) return -1;
        return a[name] - b[name];
    }
}
