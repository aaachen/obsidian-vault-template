%%
```dataview
LIST
FROM [[]]
WHERE icontains(up, this.file.link)
WHERE !icontains(this.file.outlinks, file.link)
```
%%