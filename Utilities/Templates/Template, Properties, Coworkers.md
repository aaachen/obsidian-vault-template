---
created: <% tp.date.now() %>
---

## Discuss

```dataview
TASK
WHERE contains(text, "[[<% tp.file.title %>]]") AND !completed
```

## Meetings

```dataview
LIST
FROM [[]]
WHERE contains(tags,"meeting") or contains(tags, "log/meeting")
```
