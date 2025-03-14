// https://github.com/saml-dev/obsidian-custom-js
class Log {
    async getLogContent(dv, path) {
        let page = dv.page(path);
        if (!page) {
            console.warn("File does not exist", path);
            return "";
        }
        const tags = !Array.isArray(page.tags) ? [page.tags] : page.tags;
        if (!tags.some(tag => tag.includes("log"))) {
            console.warn("File passed is not a log file", path);
            return "";
        }
        return await app.vault.read(app.vault.getAbstractFileByPath(page.file.path));
    }

    /**
     * Get a subset of log entries, for a log that's ordered in reverse chronological order (i.e. newest date log at top)
     * - under endDate and above startDate if startDate is specified
     * - under endDate otherwise
     * 
     * Ex:
     * - 2024-03-05
     * - 2024-02-01
     * - 2024-01-05
     * 
     * endDate: 2024-02-05, startDate: undefined -> 2024-02-01 - 2024-01-05
     * endDate: 2024-03-09, startDate: 2024-01-31 -> 2024-03-05 - 2024-02-01
     * 
     * @param {*} logContent - log file text
     * @param {*} endDate - luxon date token
     * @param {*} startDate - luxon date token
     * @returns 
     */
    getLogContentBetweenDates(logContent, endDate, startDate) {
        if (!logContent) {
            return ""
        }
        const headerRegex = /^## (?:\[\[(.+?)\]\]|(.+))$/gm;
        let headers = [];
        let match;

        // Parse headers and record positions
        while ((match = headerRegex.exec(logContent)) !== null) {
            const header = match[1] ?? match[2];
            let m = moment(header, ["YYYY-MM-DD - ddd MMM D", "YYYY-MM-DD"], true)
            if (m.isValid()) {
                headers.push({
                    date: m,
                    position: match.index
                });
            }
        }

        // Sort headers by date (ascending order (oldest first))
        headers.sort((a, b) => a.date - b.date);
        let startPos = undefined;
        let endPos = logContent.length;

        // Find start position (the latest header date that's before the startDate)
        const endMoment = moment(endDate.toJSDate());
        const startHeader = headers.findLast(h => h.date.isSameOrBefore(endMoment));
        if (startHeader) {
            startPos = startHeader.position;
        }

        if (!startPos) {
            return ""
        }

        // Find end position (the first header date that's after the startDate)
        if (startDate) {
            const startMoment = moment(startDate.toJSDate());
            const endHeaderIndex = headers.findIndex(h => h.date.isSameOrAfter(startMoment) && h.date.isSameOrBefore(endMoment));
            if (endHeaderIndex != -1) {
                let endHeader = headers[endHeaderIndex];
                console.log(endHeader);
                endPos = endHeader.position;
                // if endPos is the same as startPos, then there's only one header entry, get just that section
                if (endPos == startPos) {
                    if (endHeaderIndex > 0) {
                        // log has multiple entries
                        endPos = headers[endHeaderIndex - 1].position - 1;
                    } else {
                        // log only has one entry
                        endPos = logContent.length;
                    }
                }
            } else {
                // specified start date to limit range, but found none, return empty
                console.warn("Unable to find log entry in between startDate and endDate", startDate, endDate);
                return "";
            }
        }

        // Return the content between start and end positions
        return endPos >= startPos ? logContent.substring(startPos, endPos) : "";
    }

}
