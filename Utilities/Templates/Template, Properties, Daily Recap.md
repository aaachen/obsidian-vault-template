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

> [!COMPASS]-
>`BUTTON[log-effort]`   `BUTTON[log-daily]`   `BUTTON[open-memos]`
>
>> [!Sun]+ For today
>>
>>```todoist
>>filter: "due before: <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "yyyy-MM-DD - ddd MMM D")%> | due: <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "yyyy-MM-DD - ddd MMM D")%>"
>>show:
>> - description
>> - due
>>sorting:
>>  - date
>>  - priority
>>```

## Interstitial Journal

> Summary:: 

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

## Backlinks
```dataviewjs
dv.view("Utilities/Scripts/Dataview/daily-conversation-thoughts")
```

%%
## Time Spent

## Logging

proud:: 3


%%
