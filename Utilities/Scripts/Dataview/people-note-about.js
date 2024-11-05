let current = dv.current();
let currentPerson = current.file.name;
let calendarNotes = dv.pages('"Calendar/Notes"')
const none = "\\-"

// Conversation about them
let conversationsAboutThem = calendarNotes.where(p => { 
    let about = p.about ? p.about.toString() : none;
    let people = (p.people ?? []).map(p => p.fileName());
    let currentPersonRegex = new RegExp(`\\[\\[${currentPerson}(\\s*?\\|[^\\]]*)?\\]\\]`);
    return p.tags && p.tags.includes("log") || (about.search(currentPersonRegex) != -1 && !people.some(ps => ps.includes(currentPerson)))
});
let columns = ["Title", "About", "From", "Location"];
let rows = [];

conversationsAboutThem.forEach(conversation => {
    let isLog = conversation.tags && conversation.tags.includes("log");
    let people = (conversation.people ?? []).map(p => `[[${p.fileName()}]]`);
    let flocation = conversation.location && `[[${conversation.location.fileName()}]]`
	if (isLog) {
        // log file has many sections, get all sections that have about record that has person (file name)
        let from, location, linkName, date, pplKey; 
        if (Array.isArray(conversation.title)) {
		    conversation.record.forEach((r, i) => {
                let record = JSON.parse(r);
                let about = record.about ?? none;
                let speople = people.concat(record.people ?? []);
                if (about.search(currentPerson) != -1) {
                    location = record.location ? record.location : flocation ?? none;
                    date = conversation.date[i].toISODate();
                    linkName = `[[${conversation.file.name}#${conversation.title[i]}|${date} - ${conversation.title[i]}]]`;
                    rows.push([linkName, about, speople, location])
                }
		    })
        } else {
            let record = JSON.parse(conversation.record);
            let about = record.about ?? none;
            let speople = people.concat(record.people ?? []);
            if (about.search(currentPerson) != -1) {
                location = record.location ? record.location : flocation ?? none;
                date = conversation.date.toISODate();
                linkName = `[[${conversation.file.name}#${conversation.title}|${date} - ${conversation.title}]]`;
                rows.push([linkName, about, speople, location]);
            }
        }
	} else {
        rows.push([`[[${conversation.file.name}]]`, conversation.about, people, conversation.location ?? none]);
    }
})

dv.table(columns, rows);

