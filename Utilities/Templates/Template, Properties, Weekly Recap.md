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
---
[[<% tp.date.now("YYYY-MM-[w]ww", -7) %>|← Previous Week]] | [[<% tp.date.now("YYYY-MM-[w]ww", 7) %>|Next Week →]]

## ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆

```dataviewjs
await dv.view("Utilities/Scripts/Dataview/week/daily-metrics-line-chart", { startOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 0)%>", endOfWeekDate: "<%tp.date.weekday("gggg-MM-DD", 6)%>", context: this })
```

## Days in this week

Week: <%tp.date.weekday("MMM D", 0)%> - <%tp.date.weekday("MMM D", 6)%>

```dataviewjs
await dv.view("Utilities/Scripts/Dataview/week/week-days-summaries", { context: this })
```

## Photos 📷 

```photos
{
  "filters": {
    "dateFilter": {
      "ranges": [
        {
          "startDate": {
            "year": <%tp.date.weekday("YYYY", 0)%>,
            "month": <%tp.date.weekday("M", 0)%>,
            "day": <%tp.date.weekday("D", 0)%>
          },
          "endDate": {
            "year": <%tp.date.weekday("YYYY", 6)%>,
            "month": <%tp.date.weekday("M", 6)%>,
            "day": <%tp.date.weekday("D", 6)%>
          }
        }
      ]
    }
  }
}
```

%%
weight::

>[!trees]- Vault
>### Files created this week
>```dataview
>list created
>where created >= date(<% tp.date.weekday("YYYY-MM-DD", 0) %>) and created <= date(<% tp.date.weekday("YYYY-MM-DD", 6) %>)
>sort created ASC
>```

%%