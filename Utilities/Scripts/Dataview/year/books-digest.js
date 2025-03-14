// Digest of books for a year
const { Common } = await cJS();

const year = input.year ?? moment().year();

const booksReadThisYear = dv.pages('#book')
    .where(p => (Common.toArray(p.yearXPL) ?? []).includes(year.toString()))
    .sort(b => -(b.rating ?? 0)) // highest first
    .values;

// rating scale out of 7 - https://stephango.com/vault
const bookList = booksReadThisYear.map(b => `- ${(b.rating ?? 0) >= 5 ? "⭐️ " : ""} [[${b.file.name}]]`).join("\n");

dv.paragraph(`This year, I read about **${booksReadThisYear.length}** books 📖
${bookList}`);
