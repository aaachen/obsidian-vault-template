---
up:
  - "[[Occasions]]"
places: 
companions: 
created: <% tp.date.now() %>
tags:
  - occasion
---
<%*
let days = "{{VALUE:days}}".split(',');
let daysDate = days.map(d => moment(d, "yyyy-MM-DD - ddd MMM D"));
function daysOnTripSection() {
    const dv = app.plugins.plugins["dataview"].api;
	let weeks = new Set();
	days.forEach(d => {
		let page = dv.page(d)
		if (page) {
			weeks.add(page.week.fileName())
		}
	});
	weeks = Array.from(weeks).map(w => `[[${w}]]`)
	let daysLink = daysDate.map((d, i) => `[[${days[i]}|${d.format('MMM D')}]]`)
	let year = daysDate[0].year();
	return `> [!CALENDAR]+ ### Occasion
> This occasion took place in [[${year} - Vision and Reflection|${year}]] on the following days and weeks
> **Week**: ${weeks.join(", ")}
> **Day**: ${daysLink.join(", ")} 
`
}
tR += daysOnTripSection();
%>

## Journal

```query
tag:⭐️hlt
file: (<%*tR += daysDate.map(d => d.format('yyyy-MM-DD')).join(" OR ")%>)
```

## Jot


