let current = dv.current();
let links = [];
let backlinks = dv.pages(`[[${current.file.path}]]`).where(p => {
    // all periodic notes have tags
    if (Array.isArray(p.tags)) {
        return !p.tags.some(tag => tag.includes("calendar/"))
    }
    return true
});
let currDate = current.created.toISODate()

backlinks.forEach(backlink => {
    if (Array.isArray(backlink.tags) && backlink.tags.some(tag => tag.includes("log/theme"))) {
        // log
        // check the log metadata in this file (presence of date/title field) 
        const date = backlink.date
        if (!date) {
            links.push(`[[${backlink.file.name}#${current.file.name}]]`)
            return;
        }
        if (Array.isArray(date)) {
            date.forEach((d, i) => {
                if (d.toISODate() == currDate) {
                    links.push(`[[${backlink.file.name}#${backlink.title[i]}|${backlink.title[i]}]]`)
                    return;
                }
            })
        } else {
            if (date.toISODate() == currDate) {
                links.push(`[[${backlink.file.name}#${backlink.title}|${backlink.title}]]`)
            }
        }
    } else {
        // any other kind of notes
        links.push(`[[${backlink.file.name}]]`)
    }
})

let result = "";
links.forEach(link => result += "- " + link + "\n");
dv.paragraph(result);

