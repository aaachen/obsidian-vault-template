const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

// Do NOT edit this. 
// API KEY should be entered in the script settings in QuickAdd plugin options.
const API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "Google Books API Key"
const GOODREADS_URL = "https://www.goodreads.com/search?qid=&q="

module.exports = {
  entry: start,
  settings: {
    name: "Books script",
    author: "Elaws",
    options: {
      [API_KEY]: {
        type: "text",
        defaultValue: "",
        placeholder: "Google Books API Key",
      }
    },
  },
};

let QuickAdd;
let Settings;

async function start(params, settings) {
	QuickAdd = params;
	Settings = settings;

	// Possible to enter a book title or ISBN. 
	var query = await QuickAdd.quickAddApi.inputPrompt("Book title or ISBN: ");

	if (!query) {
		notice("No query entered.");
		throw new Error("No query entered.");
	}

	const searchResults = await getByQuery(query);

	const selection = await QuickAdd.quickAddApi.suggester(
		searchResults.map(formatTitleForSuggestion),
		searchResults
	);
	if (!selection) {
		notice("No choice selected.");
		throw new Error("No choice selected.");
	}
    console.log(selection);

	const selectedBook = selection.volumeInfo;

	const ISBN = getISBN(selectedBook);

    const authors = selectedBook.authors.length == 1 ? `"[[${selectedBook.authors[0]}]]"` : linkifyList(selectedBook.authors);

	QuickAdd.variables = {
		...selectedBook,
		fileName: replaceIllegalFileNameCharactersInString(selectedBook.title),
		authors: authors,
		isbn: `${ISBN.ISBN10 ? ISBN.ISBN10 : ""}`,
		// An URL to the GoodReads page of the book using its ISBN. 
		// May fail if ISBN returned by Google Books is not in Goodreads database.
		goodreadsURL: `${ISBN.ISBN13 ? GOODREADS_URL + ISBN.ISBN13 : (ISBN.ISBN10 ? GOODREADS_URL + ISBN.ISBN10 : " ")}`,
		cover: `${selectedBook.imageLinks ? selectedBook.imageLinks.thumbnail: " "}`.replace("http:", "https:"),
        pageCount: selectedBook.pageCount,
        genreLinks: linkifyList(selectedBook.categories),
        avgRating: selectedBook.averageRating,
        description: selectedBook.description,
		// Publication date
		datePublished: `${selectedBook.publishedDate ? (new Date((selectedBook.publishedDate))).getFullYear() : " "}`,
	};
}

function getISBN(item){

	var ISBN10 = " ";
	var ISBN13 = " ";
	var isbn10_data, isbn13_data;

	if(item.industryIdentifiers)
	{
		isbn10_data = (item.industryIdentifiers).find(element => element.type == "ISBN_10");
		isbn13_data = (item.industryIdentifiers).find(element => element.type == "ISBN_13");
	}

	if(isbn10_data) ISBN10 = isbn10_data.identifier;
	if(isbn13_data) ISBN13 = isbn13_data.identifier;

	return {ISBN10, ISBN13};
}

function isISBN(str){
	return /^(97(8|9))?\d{9}(\d|X)$/.test(str);
}

// Suggestion prompt will include :
// (i) prefix if a book cover is available (i for "image")
// Book's title
// Book's author
// Publication year
function formatTitleForSuggestion(resultItem){
	return `${
	resultItem.volumeInfo.imageLinks ? "(i)" : ""	
	} ${
	resultItem.volumeInfo.title} - ${
	resultItem.volumeInfo.authors ? resultItem.volumeInfo.authors[0] : ""
	} (${
	(new Date(resultItem.volumeInfo.publishedDate)).getFullYear()
	})`;
}

async function getByQuery(query) {

    const searchResults = await apiGet(query);

	if(searchResults.error)
    {
      notice("Request failed");
      throw new Error("Request failed");
    }

    if (searchResults.totalItems == 0) {
      notice("No results found.");
      throw new Error("No results found.");
    }

    return searchResults.items;
}

function linkifyList(list) {
    if (list.length === 0) return "";
    if (list.length === 1) return `\n  - "[[${list[0]}]]"`;

    return list.map(item => `\n  - "[[${item.trim()}]]"`).join("");
}

function replaceIllegalFileNameCharactersInString(string) {
	return string.replace(/[\\,#%&\{\}\/*<>$\":@.]*/g, "");
}

async function apiGet(query) {

	let finalURL = new URL(API_URL);

	finalURL.searchParams.append("q", query);
  	finalURL.searchParams.append("key", Settings[API_KEY]);

	log(finalURL.href);

	const res = await request({
		url: finalURL.href, 
		method: 'GET',
		cache: 'no-cache',
	})
	
	return JSON.parse(res);
}
