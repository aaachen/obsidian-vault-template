---
created: <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "yyyy-MM-DD - ddd MMM D")%>
tags:
  - calendar/day
week: <%*
tR += "'[[" + moment(`${tp.date.now("YYYY-MM-DD", 0, tp.file.title, "yyyy-MM-DD - ddd MMM D")}`).format("gggg-MM-[w]ww") + "]]'";
%>
month: '[[<% tp.date.now("YYYY-MM", 0, tp.file.title, "yyyy-MM-DD - ddd MMM D")%>]]'
---
## 🍃
[[<% tp.date.now("gggg-MM-DD - ddd MMM D", -1, tp.file.title, "yyyy-MM-DD - ddd MMM D") %>|← Previous Day]] | [[<% tp.date.now("gggg-MM-DD - ddd MMM D", 1, tp.file.title, "yyyy-MM-DD - ddd MMM D") %>|Next Day →]]

> [!compass]- 
> `BUTTON[select-log]`

## Interstitial Journal

- [sleep::]
- [wake::]
- [breakfast::]
- [lunch::]
- [dinner::]

## Jot



## On this day

> [!camera]+ Memories
> ```photos
> notedate
> ```

<%*
let today = moment();
today.set('year', 2024);
tR += `[[${today.format("yyyy-MM-DD - ddd MMM D")}|🛣️]]`
%>

## Backlinks
```dataviewjs
dv.view("Utilities/Scripts/Dataview/day-backlinks")
```

