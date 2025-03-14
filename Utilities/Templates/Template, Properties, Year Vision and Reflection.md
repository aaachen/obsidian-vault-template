---
up:
  - "[[My Yearbooks]]"
created: <% tp.date.now() %>
aliases:
  - "<% tp.date.now("YYYY") %>"
obsidianUIMode: preview
cssclasses:
  - wide-page
  - hide-properties-metadata-container
---

<span class="center-menu">*Theme Name*
[[<% tp.date.now("YYYY") %>-01|Jan]] - [[<% tp.date.now("YYYY") %>-02|Feb]] - [[<% tp.date.now("YYYY") %>-03|Mar]] - [[<% tp.date.now("YYYY") %>-04|Apr]] -[[<% tp.date.now("YYYY") %>-05|May]] - [[<% tp.date.now("YYYY") %>-06|Jun]] - [[<% tp.date.now("YYYY") %>-07|Jul]] - [[<% tp.date.now("YYYY") %>-08|Aug]] -[[<% tp.date.now("YYYY") %>-09|Sep]] - [[<% tp.date.now("YYYY") %>-10|Oct]] - [[<% tp.date.now("YYYY") %>-11|Nov]] - [[<% tp.date.now("YYYY") %>-12|Dec]] 
[[<% tp.date.now("YYYY", "P-1Y") %> - Vision and Reflection|← Past Year]] | [[<% tp.date.now("YYYY", "P+1Y")%> - Vision and Reflection|Next Year →]]
[[<% tp.date.now("YYYY") %> - Dashboard.canvas|✨ Wrapped ✨ ]]
</span>

## ***Vision***

_Vision is nothing but a riddle to be puzzled over the coming months_

## *Reflection*

- [[<% tp.date.now("YYYY") %> - 40 questions]]

## 📷 Photo Wall

```photos
{
  "filters": {
    "dateFilter": {
      "ranges": [
        {
          "startDate": {
            "year": <% tp.date.now("YYYY") %>,
            "month": 1,
            "day": 1
          },
          "endDate": {
            "year": <% tp.date.now("YYYY") %>,
            "month": 12,
            "day": 31
          }
        }
      ]
    }
  }
}
```