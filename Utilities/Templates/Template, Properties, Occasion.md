---
up:
  - "[[Occasions]]"
created: <% tp.date.now() %>
tags:
  - occasion
---
<%*
let days = "{{VALUE:days}}".split(',');
let daysDate = days.map(d => moment(d, "yyyy-MM-DD - ddd MMM D"));
	let startDate = moment("{{VALUE:startDate}}", "yyyy-MM-DD");
let endDate = moment("{{VALUE:endDate}}", "yyyy-MM-DD");
let daysLink;
function daysInOccasionSection() {
    const dv = app.plugins.plugins["dataview"].api;
	let weeks = new Set();
	days.forEach(d => {
		let page = dv.page(d)
		if (page) {
			weeks.add(page.week.fileName())
		}
	});
	weeks = Array.from(weeks).map(w => `[[${w}]]`)
	let daysPrepend = ">";
	daysLink = daysDate.map((d, i) => `[[${days[i]}|${d.format('MMM D')}]]`)
	
	let dvCodeBlock = `> \`\`\`dataviewjs
> await dv.view("Utilities/Scripts/Dataview/occasion/multi-days-occasion", { context: this })
> \`\`\``
	
	return `> [!CALENDAR]+ Occasion
> This took place on the following days and week${weeks.length > 1 ? "s" : ""}
> **Week**: ${weeks.join(", ")}
${dvCodeBlock}
`
}
tR += daysInOccasionSection();
%>

## Photos 📷 

```photos
{
  "filters": {
    "dateFilter": {
      "ranges": [
        {
          "startDate": {
            "year": <%* tR += startDate.year() %>,
            "month": <%* tR += startDate.month() + 1 %>,
            "day": <%* tR += startDate.date() %>
          },
          "endDate": {
            "year": <%* tR += endDate.year() %>,
            "month": <%* tR += endDate.month() + 1 %>,
            "day": <%* tR += endDate.date() %>
          }
        }
      ]
    }
  }
}
```




<%*
tR += `%%
${daysLink.join(", ")}
%%`
%>