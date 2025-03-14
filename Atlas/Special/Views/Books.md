---
up:
  - "[[Literature Map]]"
created: 2022-01-01
banner: "https://myreadingvintage.com/cdn/shop/articles/book_journal_printable_2ae634b6-8845-42b7-a0a2-f2b84198e951_1200x.png?v=1703619908"
banner_y: 0.22172
obsidianUIMode: preview
cssclasses:
  - wide-page
  - cards
  - table-max
modified: 2024-12-10
---
```dataview
table without id 
	("![|100](" + cover + ")") as Cover, 
	file.link as Title, 
	join(flat(sort(list(yearXPL))), ", ") as Read,
	join(author, ", ") as Author,
	rating, 
	join(genre, ", ") as Genre,
	date(published).year as Published
FROM "Atlas/Literature"
SORT flat(sort(list(yearXPL)))[0] DESC
WHERE icontains(up, this.file.link)
```

