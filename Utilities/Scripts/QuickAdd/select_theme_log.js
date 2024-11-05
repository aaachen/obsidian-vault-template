module.exports = {
    entry: start,
    settings: {
        name: "Select Theme Log",
        author: "Andrew Chen",
        options: {
        }
    }
}

let QuickAdd;
let Settings;

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;

    const dv = app.plugins.plugins["dataview"].api;
    const themeLogs = dv.pages("#log/theme").where(p => !p.file.name.startsWith("Template, Properties")).values;

    const choice = await QuickAdd.quickAddApi.suggester(themeLogs.map(l => l.file.name), themeLogs.map(l => l.file.path));

    if (!choice) {
        notice("No choice selected.");
        throw new Error("No choice selected.");
    }

    QuickAdd.variables = {
        path: choice
    }
}

