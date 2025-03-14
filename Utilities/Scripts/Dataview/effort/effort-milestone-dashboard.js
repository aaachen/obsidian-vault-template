// Visualize the milestones of an effort
const { Milestone, Common, Log } = await cJS();
const effortPage = dv.current();
const effortName = effortPage.file.name;
if (!effortPage.tags || !effortPage.tags.includes("effort")) {
    throw new Error("Not in an effort page");
}
const container = input.context.container;
const milestones = Milestone.getMilestones(effortPage).filter(m => m.accomplished || m.target);
if (!milestones.length) {
    return;
}
const logContent = await getLogContent(effortPage);
milestones.sort((a, b) => (a.accomplished ?? a.target).valueOf() - (b.accomplished ?? b.target).valueOf())
const milestonesDataset = milestones.map((m, i) => {
    const prevMilestoneDate = i > 0 ? (milestones[i - 1].accomplished || milestones[i - 1].target) : null;
    const currentMilestoneDate = m.accomplished ?? m.target;
    let log = Log.getLogContentBetweenDates(logContent, currentMilestoneDate, prevMilestoneDate)
    if (log) {
        log = `>[!log]-\n` + Common.wrapInQuoteBlock(log);
    }
    return {
        id: i,
        content: `${m.accomplished ? "📍" : "🚩"} ${m.milestoneName}`,
        start: currentMilestoneDate.toFormat('yyyy-MM-dd'),
        description: m.desc,
        isAccomplished: !!m.accomplished,
        log: log
    }
});
await loadVisJsLibrary();
const milestoneDayDiffs = milestonesDataset.length > 1 ? getMilestonesDayRange(milestonesDataset) : undefined;
const timeline = createTimeline(container, milestonesDataset, milestoneDayDiffs);
const milestoneDetailEl = container.createEl('div', { attr: { id: 'details' } });
let prevId = undefined;
timeline.on('select', function (properties) {
    if (properties.items.length) {
        const selectedItemId = properties.items[0];
        if (selectedItemId == prevId) {
            return;
        }
        const selectedMilestone = milestonesDataset[selectedItemId];
        // Clear previous content
        milestoneDetailEl.innerHTML = '';
        const titleEl = milestoneDetailEl.createEl('h5');
        titleEl.textContent = selectedMilestone.content;
        const logCallout = selectedMilestone.log;
        const detail = `${selectedMilestone.description || 'No description'} - 🗓️ **${selectedMilestone.start}**\n${logCallout}`
        dv.el("p", detail, { container: milestoneDetailEl });
        prevId = selectedItemId;
    } else {
        milestoneDetailEl.innerHTML = '';
        prevId = undefined;
    }
});

/**
* Get the content of the log for this effort
*/
async function getLogContent(effortPage) {
    const logLink = effortPage.file.inlinks.find(l => {
        const p = dv.page(l.path);
        const isUpLinked = Common.containsUp(p, effortPage.file.name);
        return isUpLinked && Array.isArray(p.tags) && p.tags.some(tag => tag.includes("log"))
    });
    return logLink ? await app.vault.read(app.vault.getAbstractFileByPath(logLink.path)) : "";
}

function getMilestonesDayRange(milestones) {
    const [first, last] = milestones.reduce((acc, milestone) => {
        const date = new Date(milestone.start);
        if (!acc[0] || date < new Date(acc[0].start)) acc[0] = milestone;
        if (!acc[1] || date > new Date(acc[1].start)) acc[1] = milestone;
        return acc;
    }, [null, null]);

    const date1 = first.start
    const date2 = last.start
    return moment(date2).diff(moment(date1), 'days');
}

function createTimeline(container, items, milestoneDayDiffs) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const zoomMax = milestoneDayDiffs ? ONE_DAY * (milestoneDayDiffs + 180) : ONE_DAY * 365;
    const timelineDiv = container.createEl('div', { attr: { id: 'timeline' } });
    const options = {
        zoomMin: ONE_DAY * 30, // Minimum zoom level (30 days)
        zoomMax: zoomMax
    };
    const timeline = new vis.Timeline(timelineDiv, items, options);
    return timeline;
}

/**
 * Alternatively, from CDN which include latest build
 * const script = container.createEl("script");
 * script.src = "https://unpkg.com/vis-timeline@7.7.3/standalone/umd/vis-timeline-graph2d.min.js";
 * script.onload = () => { }
 */
async function loadVisJsLibrary() {
    const visScript = await app.vault.adapter.read("/Utilities/Scripts/vis-timeline-graph2d@7.7.3.min.js");
    eval(visScript);
}
