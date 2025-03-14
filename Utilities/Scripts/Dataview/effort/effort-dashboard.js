// Dashboard in effort page, DV js created to support both external and internal board links

// Views are not actionable (i.e. Writing projects (view) vs. a writing project, Learning (skills to up-scale career) vs. a thing to learn))
const isView = input.isView ?? false;

const level = input.level;
if (!isView && !level) {
    throw new Error("No intensity level");
}
let effortPages;
if (isView) {
    effortPages = dv.pages(`#effort/view`).values;
} else {
    effortPages = dv.pages(`#effort`)
        .where(p => !p.file.path.includes("Utilities") && p.intensity == level)
        .values;
}

let rows = effortPages.map(p => {
    const fileLink = p.file.link;
    const rank = p.rank;
    let board = p.board;
    if (!board) {
        board = undefined;
    } else if (typeof board == "string") {
        // assume it's external link
        board = `[⤴️](${board})`
    } else if (board.path) {
        // internal link
        board.display = "⤴️";
    } else {
        throw new Error(`Unrecognized board metadata=[${board}]`);
    }
    return isView ? [fileLink, board] : [fileLink, rank, board];
});

if (!isView) {
    // sort descending by rank
    rows.sort((a, b) => b[1] - a[1]);
} else {
    // sort whether there's a board
    rows.sort((a, b) => {
        if (a[1] && !b[1]) return -1;
        if (!a[1] && b[1]) return 1;
        return 0;
    });
}

dv.table(
    isView ? ["", "Board"] : ["", "Rank", "Board"],
    [...rows]
);