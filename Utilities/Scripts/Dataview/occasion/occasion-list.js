// List of occasions
const { Common } = await cJS();
let { category, year, allInCallouts } = input;
allInCallouts = !!allInCallouts;
// Category of the occasion used by the tag (i.e. travel)
const occasionTagName = `#occasion${category ? `/${category}` : ""}`;
function getFileLinksData(yr) {
    const pages = dv.pages(`${occasionTagName} and "${Common.getYearFolderPath(yr)}"`)
        .where(p => p.tags.some(t => t === occasionTagName.substring(1)))
        .values;
    const fileLinks = pages.map(p => {
        if (p.occasion || p.summary) {
            // a daily note with occasion field as description
            return {
                date: p.created.toFormat('yyyy-MM-dd'),
                occasion: p.occasion ? p.occasion : p.summary,
                path: p.file.path
            }
        } else {
            // a separate file where file name itself contains the description (single/multi-days)
            let names = p.file.name.split(' - ');
            let date, occasion;
            if (names.length > 1) {
                date = names[0];
                occasion = names.slice(1).join(' - ');
            } else {
                // fallback
                date = p.created.toFormat('yyyy-MM');
                occasion = p.file.name;
            }
            return {
                date: date,
                occasion: occasion,
                path: p.file.path
            }
        }
    });
    fileLinks.sort((a, b) =>
        moment(a.date, ["YYYY-MM-DD", "YYYY-MM"]).valueOf() - moment(b.date, ["YYYY-MM-DD", "YYYY-MM"]).valueOf()
    );
    return fileLinks;
}

// make only the description part clickable to reduce visual strain of links
function getFormattedLink(linkData) {
    const occasion = linkData.occasion.replaceAll(/(\[\[|\]\])/g, "");
    return `${linkData.date} - [[${linkData.path}|${occasion}]]`
}

if (allInCallouts) {
    const startYear = 2024; // when I started doing this
    const endYear = moment().year();
    for (let i = startYear; i <= endYear; i++) {
        const p = getFileLinksData(i)
            .map(l => `> - ${getFormattedLink(l)}`)
            .join('\n') + '\n';
        const paragraph = `>[!calendar]- ${i}\n${p}\n`;
        dv.paragraph(paragraph);
    }
} else {
    const paragraph = getFileLinksData(year)
        .map(l => `- ${getFormattedLink(l)}`)
        .join('\n') + '\n';
    dv.paragraph(paragraph);
}
