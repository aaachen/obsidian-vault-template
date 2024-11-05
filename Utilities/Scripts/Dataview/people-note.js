// TODO: add and query by tag (i.e. #conversation, #thoughts) if performance becomes issue
let current = dv.current();
let currentPerson = current.file.name;
let calendarNotes = dv.pages('"Calendar/Notes"')
const none = "\\-"

// Conversation we had
let conversationsWeHad = calendarNotes.where(p => p.tags && p.tags.includes("log") || p.people && p.people.some(person => person.path.split('/').pop().includes(`${currentPerson}.md`)));
let columns = ["Title", "About", "Location"];
let rows = []

conversationsWeHad.forEach(conversation => {
    let isLog = conversation.tags && conversation.tags.includes("log");
    let people = (conversation.people ?? []).map(p => `[[${p.fileName()}]]`);
    let flocation = conversation.location && `[[${conversation.location.fileName()}]]`
	if (isLog) {
        // log file has many sections, get all sections that have people record has person (file name)
        let about,location,linkName,date; 
        if (Array.isArray(conversation.title)) {
		    conversation.record.forEach((r, i) => {
                let record = JSON.parse(r);
                let speople = people.concat(record.people ?? []);
                if (speople.includes(`[[${currentPerson}]]`)) {
                    about = record.about ?? none;
                    location = record.location ? record.location : flocation ?? none;
                    date = conversation.date[i].toISODate();
                    linkName = `[[${conversation.file.name}#${conversation.title[i]}|${date} - ${conversation.title[i]}]]`
                    rows.push([linkName, about, location])
                }
		    })
        } else {
            let record = JSON.parse(conversation.record);
            let speople = people.concat(record.people ?? [])
            if (speople.includes(`[[${currentPerson}]]`)) {
                about = record.about ?? none;
                location = record.location ? record.location : flocation ?? none;
                date = conversation.date.toISODate();
                linkName = `[[${conversation.file.name}#${conversation.title}|${date} - ${conversation.title}]]`;
                rows.push([linkName, about, location]);
            }
        }
	} else {
        rows.push([`[[${conversation.file.name}]]`, conversation.about ?? none, conversation.location ?? none]);
    }
})

dv.table(columns, rows);

