---
vision: '[[<% tp.date.now("YYYY") %> - Vision]]'
review: '[[<% tp.date.now("YYYY") %> - Year in Review]]'
created: <% tp.date.now() %>
year: <% tp.date.now("YYYY") %>
---
```dataviewjs
await dv.view("Utilities/Scripts/Dataview/year-dashboard")
```
