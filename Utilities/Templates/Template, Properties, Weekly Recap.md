---
created: <% tp.date.now() %>
tags:
  - calendar/week
year: '[[<% tp.date.now("YYYY") %> - Vision and Reflection]]'
month: 
<%*
let r = `  - "[[${tp.date.now("YYYY-MM")}]]"`
let wfdm = tp.date.weekday("MMM", 0);
let wldm = tp.date.weekday("MMM", 6);
if (wfdm != wldm) {
  r += `\n  - "[[${tp.date.weekday("YYYY-MM", 6)}]]"`
}
tR += r
%>
quarter: '[[<%*
let q = Math.floor(new Date().getMonth() / 3) + 1;
let y = new Date().getFullYear();
tR += `${y} - Q${q}`;
%>]]'
---
[[<% tp.date.now("YYYY-MM-[w]ww", -7) %>|← Previous Week]] | [[<% tp.date.now("YYYY-MM-[w]ww", 7) %>|Next Week →]]

```dataviewjs
await dv.view("Utilities/Scripts/Dataview/weekly-dashboard", { startOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 0)%>", endOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 6)%>", context: this })
```

## Days in this week

Week: <%tp.date.weekday("MMM D", 0)%> - <%tp.date.weekday("MMM D", 6)%>

```dataview
TABLE WITHOUT ID
	link(file.link, dateformat(created, "ccc")) as Day,
	Summary as " "
FROM [[]]
WHERE contains(tags, "calendar/day")
SORT created ASC
```
## Milestone

```dataviewjs
await dv.view("Utilities/Scripts/Dataview/weekly-milestone-dashboard", { startOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 0)%>", endOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 6)%>", context: this })
```

## Effort

%%
weight::
%%

> [!COMPASS]- Accomplishment
> 
> `BUTTON[weekly-effort]`
> 
> ```dataviewjs
> await dv.view("Utilities/Scripts/Dataview/weekly-time-spent-dashboard", { startOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 0)%>", endOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 6)%>"})
> ```

### Summary


%%

>[!trees]- Vault
>### Files created this week
>```dataview
>list created
>where created >= date(<% tp.date.weekday("YYYY-MM-DD", 0) %>) and created <= date(<% tp.date.weekday("YYYY-MM-DD", 6) %>)
>sort created ASC
>```

%%