const notice = msg => new Notice(msg, 5000);
const log = msg => console.log(msg);

const API_KEY_OPTION = "OMDb API Key";
const API_URL = "https://www.omdbapi.com/";

module.exports = {
    entry: start,
    settings: {
        name: "Add Shows, Movies, Games from IMDB",
        author: "Andrew Chen",
        options: {
            [API_KEY_OPTION]: {
                type: "text",
                defaultValue: "",
                placeholder: "OMDb API Key",
            },
        }
    }
}

let QuickAdd;
let Settings;

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;

    const query = await QuickAdd.quickAddApi.inputPrompt("Enter show/movie/game title or IMDB ID: ");
    if (!query) {
        notice("No query entered.");
        throw new Error("No query entered.");
    }

    let selectedShow;

    if (isImdbId(query)) {
        selectedShow = await getByImdbId(query);
    } else {
        const results = await getByQuery(query);

        const choice = await QuickAdd.quickAddApi.suggester(results.map(formatTitleForSuggestion), results);
        if (!choice) {
            notice("No choice selected.");
            throw new Error("No choice selected.");
        }

        selectedShow = await getByImdbId(choice.imdbID);
    }
    console.log(selectedShow);

    // normalize writer (remove role description)
    if (selectedShow.Writer) {
        selectedShow["Writer"] = selectedShow.Writer.replace(/\s*\([^)]*\)/g, '');
    }
    
    // replace director with writers if absent
    if (!selectedShow.Director || selectedShow.Director == "N/A" && selectedShow.Writer) {
        selectedShow.Director = selectedShow.Writer;
    }

    let type = getType(selectedShow.Type);

    QuickAdd.variables = {
        ...selectedShow,
        actorLinks: linkifyList(selectedShow.Actors.split(",")),
        genreLinks: linkifyList(selectedShow.Genre.split(",")),
        directorLink: linkifyList(selectedShow.Director.split(",")),
        writerLink: linkifyList(selectedShow.Writer.split(",")),
        fileName: replaceIllegalFileNameCharactersInString(selectedShow.Title),
        typeLink: `[[${type}]]`,
        languageLower: selectedShow.Language.toLowerCase(),
    }
}

function isImdbId(str) {
    return /^tt\d+$/.test(str);
}

function formatTitleForSuggestion(resultItem) {
    let type = resultItem.Type;
    let shortType = type === "movie" ? "M" : 
        type === "game" ? "G" : 
        type === "series" ? "TV" : 
        resultItem.Type;
    return `(${shortType}) ${resultItem.Title} (${resultItem.Year})`;
}

function getType(type) {
    let result;
    if (type == "movie") {
        result = "Movies";
    } else if (type == "game") {
        result = "Video Games";
    } else if (type == "series") {
        result = "Series";
    } else {
        result = "Unknown";
    }
    return result;
}

async function getByQuery(query) {
    const searchResults = await apiGet(API_URL, {
        "s": query,
    });

    if (!searchResults.Search || !searchResults.Search.length) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    return searchResults.Search;
}

async function getByImdbId(id) {
    const res = await apiGet(API_URL, {
        "i": id
    });

    if (!res) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    return res;
}

function linkifyList(list) {
    if (list.length === 0) return "";
    if (list.length === 1) return `\n  - "[[${list[0]}]]"`;

    return list.map(item => `\n  - "[[${item.trim()}]]"`).join("");
}

function replaceIllegalFileNameCharactersInString(string) {
    return string.replace(/[\\,#%&\{\}\/*<>$\'\":@]*/g, '');    
}

async function apiGet(url, data) {
    let finalURL = new URL(url);
    if (data)
        Object.keys(data).forEach(key => finalURL.searchParams.append(key, data[key]));

    finalURL.searchParams.append("apikey", Settings[API_KEY_OPTION]);

    const res = await request({
        url: finalURL.href,
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return JSON.parse(res);
}
