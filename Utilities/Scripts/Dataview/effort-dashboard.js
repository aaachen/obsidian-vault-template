// DV js created to support both external and internal board links
const level = input.level;
if (!level) {
    throw new Error("Please supply correct effort intensity level");
}
const effortPages = dv.pages(`"Efforts"`).where(p => p.intensity == level).values;
let rows = effortPages.map(p => {
    let fileLink = p.file.link;
    let rank = p.rank;
    let board = p.board;
    if (!board) {
        board = undefined;
    } else if (typeof board == "string") {
        // assume it's external link
        board = `[⤴️](${board})`
    } else if (board.path) {
        // internal link
        board.display = "⤴️"
    } else {
        throw new Error(`Unrecognized board metadata=[${board}]`)
    }
    return [fileLink, rank, board];
});
// sort descending
rows.sort((a, b) => b[1] - a[1]);

dv.table(
  ["", "Rank", "Board"],
  [...rows]
);