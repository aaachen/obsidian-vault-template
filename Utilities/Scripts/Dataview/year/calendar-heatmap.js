const { Common } = await cJS();
const container = input.context.container;
const year = input.year;

let calendarData = {
	year: input.year,
	colors: {
		green: ["#dbd4bd", "#A9C46C", "#5D8736"]
	},
	entries: []
}

for (const page of dv.pages(`"${Common.getYearFolderPath(input.year)}" and #calendar/day`)) {
	let journalNames = [];
	// i.e. special conversations, occasions, etc.
	let upLinkFileNames = [];

	const backlinks = page.file.inlinks
		.map(link => dv.page(link.path));

	for (const backlink of backlinks) {
		if (backlink && backlink.tags &&
			(backlink.tags.some(t => t.includes("log")) && backlink.file.name.includes("Journal"))) {
			journalNames.push(backlink.file.name);
		}
		if (backlink && backlink.up && backlink.up.some(u => u.path == page.file.path)) {
			upLinkFileNames.push(backlink.file.name);
		}
	}

	// Content preview in the order: journal -> uplink -> daily note
	let contentPath;
	if (journalNames.length) {
		contentPath = journalNames[0] + `#${page.file.name}`;
	} else if (upLinkFileNames.length) {
		contentPath = upLinkFileNames[0];
	} else {
		contentPath = page.file.name
	}
	const intensity = 1 + !!journalNames.length + !!upLinkFileNames.length;
	calendarData.entries.push({
		date: page.created.toFormat("yyyy-MM-dd"),
		intensity: intensity,
		content: await dv.span(`[[${contentPath}|]]`), // hover preview
	})
}
renderHeatmapCalendar(container, calendarData)
