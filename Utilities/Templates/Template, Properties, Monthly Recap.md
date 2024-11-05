---
created: <% tp.date.now() %>
tags:
  - calendar/month
year: '[[<% tp.date.now("YYYY") %> - Vision and Reflection]]'
quarter: '[[<%*
let q = Math.floor(new Date().getMonth() / 3) + 1;
let y = new Date().getFullYear();
let qfn = `${y} - Q${q}`
tR += qfn;
%>]]'
cssclasses:
  - hide-embedded-header
---
<%*
// useful variables to define
let now = new Date();
let year = now.getFullYear(), month = now.getMonth() + 1, startMonth = month;
// TODO: refactor below garbage. For getting week numbers in month, use tp.date.weekday, see week template
let daysInMonth = new Date(year, month, 0).getDate()
let sumStartMonth = [...new Array(month - 1).keys()].reduce((acc, i) => acc + new Date(year, i + 1, 0).getDate(), 0);
let sumEndMonth = [...new Array(month).keys()].reduce((acc, i) => acc + new Date(year, i + 1, 0).getDate(), 0);
let startWeekNum = sumStartMonth / 7;
if (!Number.isInteger(startWeekNum)) {
	startWeekNum = Math.ceil(startWeekNum);
	startMonth = month > 1 ? month - 1 : month;
} 
let endWeekNum = Math.ceil(sumEndMonth / 7);
%>
[[<% tp.date.now("YYYY-MM", "P-1M") %>|← Previous Month]] | [[<% tp.date.now("YYYY-MM", "P1M") %>|Next Month →]]

## Milestone

```dataview
TABLE WITHOUT ID 
file.link as "Effort", L.Milestone as "Milestone", L.Desc as "Description", L.Target as "Target", choice(L.Accomplished and date(L.Accomplished) <= date("<%moment().endOf('month').format('YYYY-MM-DD')%>"), "✅", "") AS "Reached"
FROM #effort
FLATTEN file.lists AS L
WHERE L.Milestone AND date(L.Target) > date("<%moment().startOf('month').format('YYYY-MM-DD')%>") AND date(L.Target) <= date("<%moment().endOf('month').format('YYYY-MM-DD')%>")
SORT date(L.Target) ASC
```


## Days in this month

> [!CALENDAR]- Calendar
>TODO: screenshot of this month 🗓️ 
> [⤴️](https://calendar.google.com/calendar/u/0/r/month/<%*tR+= `${year}/${month}/1`%>)
>
>>[!tldr]- Days in the weeks
<%*
let wn = Array.from({length: endWeekNum - startWeekNum + 1}, (_, i) => startWeekNum + i).map(n => n < 10 ? `0${n}`: `${n}`)
start = wn.shift();
tR += `>>## Week ${start}\n>> ![[${year}-${startMonth < 10 ? "0" + startMonth : startMonth}-w${start}#Days in this week]]`
wn.forEach(n => tR += `\n>>\n>>\n>>## Week ${n}\n>> ![[${year}-${month < 10 ? "0" + month : month}-w${n}#Days in this week]]`)
%>
>
>>[!connect]- Metrics
>>
>>```dataviewjs
>>await dv.view("Utilities/Scripts/Dataview/weekly-dashboard", { isMonth: true, month: <%*tR += month%>, context: this })
>>```

> Summary::

## Free Write


> What does *[[<% tp.date.now("YYYY") %> - Vision and Reflection|Engagement]]* mean to you this month?

