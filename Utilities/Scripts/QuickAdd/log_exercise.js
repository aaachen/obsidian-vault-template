const log = msg => console.log(msg);

module.exports = {
    entry: start,
    settings: {
        name: "Log Exercise",
        author: "Andrew Chen",
        options: {
        }
    }
}

let QuickAdd;
let Settings;

/**
 *
 * ```js quickadd
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('exercise');
const buildRecordJson = (tups) => {
    let json = {}
    tups.forEach(tup => {
        if (tup[1]) {
            json[tup[0]] = !isNaN(tup[1]) ? Number(tup[1]) : tup[1];
        }
    })
    return JSON.stringify(json);
}
let tups = [["lbs", result.get('weight')], ["reps", result.get('reps')], ["set", result.get('set')], ["time", result.get('time')], ["distance", result.get('distance')], ["rpe", result.get('rpe')]]
let res = `- [exercise::${result.get('exercise')}], [record::${buildRecordJson(tups)}]\n`
return res;
```
 */

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;

    const modalForm = app.plugins.plugins.modalforms.api;
	const result = await modalForm.openForm('exercise');
    let record = {}
    let lbs = result.get('weight');
    let reps = result.get('reps');
    let set = result.get('set');
    let time = result.get('time');
    let distance = result.get('distance');
    let elevation = result.get('elevation');
    let trailName = result.get('trailName');
    let rpe = result.get('rpe');

    if (lbs) {
        record["lbs"] = Number(lbs);
    }
    if (reps) {
        record["reps"] = Number(reps);
    }
    if (set) {
        set = Number(set);
    }
    if (time) {
        record["time"] = time;
    }
    if (distance) {
        record["distance"] = Number(distance);
    }
    if (elevation) {
        record["elevation"] = Number(elevation);
    }
    if (trailName) {
        record["trailName"] = trailName;
    }
    if (rpe) {
        record["rpe"] = Number(rpe);
    }

    let snippet = `- [exercise::${result.get('exercise')}], [record::${JSON.stringify(record)}]\n`
    if (set) {
        snippet = snippet.repeat(set)
    }

    QuickAdd.variables = {
        snippet: snippet
    }
}

