---
created: <% tp.date.now() %>
tags:
  - calendar/month
year: '[[<% tp.date.now("YYYY") %> - Vision and Reflection]]'
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

## Days in this month

> [!CALENDAR]- Calendar
> [🗓️ Calendar](https://calendar.google.com/calendar/u/0/r/month/<%*tR+= `${year}/${month}/1`%>)
>>[!connect]- Dashboard
>>
>>```dataviewjs
>>await dv.view("Utilities/Scripts/Dataview/week/daily-metrics-line-chart", { isMonth: true, month: <%*tR += month%>, context: this })
>>```
>
<%*
let wn = Array.from({length: endWeekNum - startWeekNum + 1}, (_, i) => startWeekNum + i).map(n => n < 10 ? `0${n}`: `${n}`)
start = wn.shift();
tR += `>## Week ${start}\n> ![[${year}-${startMonth < 10 ? "0" + startMonth : startMonth}-w${start}#Days in this week]]\n> ![[${year}-${startMonth < 10 ? "0" + startMonth : startMonth}-w${start}#Photos 📷]]`
wn.forEach(n => tR += `\n>\n>\n>## Week ${n}\n> ![[${year}-${month < 10 ? "0" + month : month}-w${n}#Days in this week]]\n> ![[${year}-${month < 10 ? "0" + month : month}-w${n}#Photos 📷]]`)
%>


### Milestone

<%* 
const date = moment(tp.file.title, 'YYYY-MM-DD'); 
const startOfMonth = date.clone().startOf('month').format('YYYY-MM-DD'); 
const endOfMonth = date.clone().endOf('month').format('YYYY-MM-DD'); 
const result = `\`\`\`dataviewjs
await dv.view("Utilities/Scripts/Dataview/month/month-milestone-dashboard", { start: "${startOfMonth}", end: "${endOfMonth}", context: this })
\`\`\``;
tR += result;
%>