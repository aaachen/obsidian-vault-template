---
up:
  - '[[<% tp.date.now("YYYY") %> - Vision and Reflection]]'
created: <% tp.date.now() %>
---

[[<%*
let q = Math.floor(new Date().getMonth() / 3) + 1;
let y = new Date().getFullYear();
if (q == 1) {
	tR += `${y-1} - Q4`;
} else {
	tR += `${y} - Q${q-1}`;
}
%>|← Previous Quarter]] | [[<%*
if (q == 4) {
	tR += `${y+1} - Q1`;
} else {
	tR += `${y} - Q${q+1}`;
}
%>|Next Quarter→]]

My vision for this year: [[<% tp.date.now("YYYY") %> - Vision and Reflection]]

# Reflection

[[<% tp.date.now("YYYY") %> - Effort Progression]]

>[!SUN]- Months
> TODO: make below automatic
> 
> ## [[2024-05|May]]
> ![[2024-05#Free Write]]

*Free write*
