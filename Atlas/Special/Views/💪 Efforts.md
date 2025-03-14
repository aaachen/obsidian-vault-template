---
up:
  - "[[Home]]"
created: 2023-08-19
tags:
  - map
obsidianUIMode: preview
modified: 2025-03-13
aliases:
  - Effort
---

> [!radar]- View
>```dataviewjs
>await dv.view("Utilities/Scripts/Dataview/effort/effort-dashboard", { context: this , isView: true})
>```

> [!Box]+ 🔥 On
>```dataviewjs
>await dv.view("Utilities/Scripts/Dataview/effort/effort-dashboard", { context: this , level: "On 🔥"})
>```

> [!Box]+ ♻️ Ongoing
>```dataviewjs
>await dv.view("Utilities/Scripts/Dataview/effort/effort-dashboard", { context: this , level: "Ongoing ♻️"})
>```

> [!Box]+ 〰️ Simmering
>
>```dataviewjs
>await dv.view("Utilities/Scripts/Dataview/effort/effort-dashboard", { context: this , level: "Simmering 〰️"})
>```

> [!Box]- 💤 Sleeping
> 
>```dataviewjs
>await dv.view("Utilities/Scripts/Dataview/effort/effort-sleeping-dashboard", { context: this , level: "Sleeping 💤 "})
>```
> 
