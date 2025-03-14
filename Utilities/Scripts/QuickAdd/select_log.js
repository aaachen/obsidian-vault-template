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
    const themeLogs = dv.pages("#log").where(p => !p.file.name.startsWith("Template, Properties")).values;
    themeLogs.sort((a, b) => {
        // Check if one is pinned and the other isn't
        const isPinnedA = a.file.tags.includes("#log/pinned");
        const isPinnedB = b.file.tags.includes("#log/pinned");

        if (isPinnedA && !isPinnedB) return -1; // Pinned logs come first
        if (!isPinnedA && isPinnedB) return 1;  // Non-pinned logs come second

        // If both are the same type, sort by last modified date (descending)
        return b.modified ?? b.file.mtime - a.modified ?? a.file.mtime;
    });

    const choice = await QuickAdd.quickAddApi.suggester(
        themeLogs.map(l => `${l.tags.includes("log/pinned") ? "📌 " : ""}${l.file.name}`),
        themeLogs.map(l => l.file.path)
    );

    if (!choice) {
        notice("No choice selected.");
        throw new Error("No choice selected.");
    }

    QuickAdd.variables = {
        path: choice
    }
}
