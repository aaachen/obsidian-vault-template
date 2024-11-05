const log = msg => console.log(msg);

module.exports = {
    entry: start,
    settings: {
        name: "Append Log Section Metadata",
        author: "Andrew Chen",
        options: {
        }
    }
}

let QuickAdd;
let Settings;

// - [title:: Day 2 十分瀑布], [date:: 2024-02-06], [dateNote:: [[2024-02-06 - Tue Feb 6]]], [record:: {"people": ["[[Someone]]"], "about": "瀑布与人生"}]

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;

    const modalForm = app.plugins.plugins.modalforms.api;
	const result = await modalForm.openForm('append_log_metadata');
    let dateNote = moment().format('yyyy-MM-DD - ddd MMM D');
    let date = moment().format('yyyy-MM-DD');
    let title = result.get('title');

    let record = {}
    let datePrompt = result.get('date');
    let people = result.get('people');
    let about = result.get('about');
    let location = result.get('location');
    let tags = result.get('tags');

    if (datePrompt) {
        date = datePrompt
    }

    if (people && JSON.parse(people).length > 0) {
        record["people"] = JSON.parse(people).map(p => `[[${p}]]`);
    }

    if (about) {
        record["about"] = about;
    }
    if (location) {
        record["location"] = location;
    }
    if (tags) {
        record["tags"] = JSON.parse(tags).map(t => "#" + t);
    }
    let snippet = `##### ${title}\n- [title:: ${title}], [date:: ${date}], [record:: ${JSON.stringify(record)}]`

    QuickAdd.variables = {
        snippet: snippet
    }
}

