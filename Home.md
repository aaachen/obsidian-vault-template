---
banner: "![[forest-torii.png]]"
banner_y: 0.436
cssclasses:
  - wide-page
  - hide-properties-metadata-container
  - hide-title
banner_x: 0.46038
obsidianUIMode: preview
modified: 2024-11-05
---
`BUTTON[week-menu]` 🌱 `BUTTON[yearly-dashboard]` 

> [!SUN]- ### Goals & Habit
>
>> [!multi-column]
>>
>>> ```dataviewjs
>>> await dv.view("Utilities/Scripts/Dataview/home-goal", {context: this})
>>> ```
>>
>>> ```dataviewjs
>>> await dv.view("Utilities/Scripts/Dataview/home-habits", {context: this})
>>> ```

> [!Multi-column] 
> 
> > [!Map]+ ### Atlas
> > > *Where would you like to go?*
> > 
> > **Knowledge**
> > - [[Library ⚖️]] | [[Sources Map]]
> >   
> > **Inspired Work**
> > - [[Writing Inbox]]
> > 
> > **Personal**
> > - [[Life Map 🗺️]] | [[Cabin 🪵]] | [[People Map]] | [[Places Map]]
> > - [[🌼 My Health]] | [[💰 My Finance]]
>
> > [!Calendar]+ ### Calendar
> > > *What's on your mind?*
> >
> > **Recent**
> > -  `=link(dateformat(date(today), "yyyy-MM-wWW"), "🐛 This week")` | `=link(dateformat(date(today), "yyyy-MM"), "🦋 This month")` 
> > 
> > **Logs**
> > -  [[Themed Logs]]
> > 
> > **Personal Journals**
> > - [[Journal Log]] | [[me]]/[[Myself 🧘🏽‍♂️]] | [[Epochs of My Life]]
> > 
> > **General**
> > -  [[My Yearbooks]] | [[Calendar]]
> >
> 
> > [!Training]+ ### Effort
> > > *Where do you like to work on?*
> > 
> > [[💪 Efforts]] - concentrated view of all efforts
> >  
> > #### 🔥 On
>>```dataviewjs
>> await dv.view("Utilities/Scripts/Dataview/effort-dashboard", { context: this , level: "On 🔥"})
>>```
>>
>>#### ♻️ Ongoing
>>```dataviewjs
>> await dv.view("Utilities/Scripts/Dataview/effort-dashboard", { context: this , level: "Ongoing ♻️"})
>>```
