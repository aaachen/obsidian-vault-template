/**
 * Dashboard for a given year
 * - Months and weeks
 * - Dashboard for the relevant areas (sleep, health, etc.)
 */

let qm = [[1,2,3], [4,5,6], [7,8,9], [10,11,12]];
let currDate = new Date();
let currM = currDate.getMonth();
let currY = currDate.getFullYear();
let q = Math.floor(currM / 3) + 1;
let y = dv.current().created.c.year
let isCurrentYear = y === currY

// Render current quarter
if (isCurrentYear) {
    // For current quarters, display in order of 
    // - q4 review q1 planning (q4 of previous year)
    // - q1 review q2 planning
    // - q2 review q3 planning
    // - q3 review q4 planning
	let ql = `${y} - Q${q}|Q${q}`;
	dv.span(`## Current Quarter - [[${ql}]]`);
	let currentQuarterMonths = qm[q-1];
	
	let months = dv.pages('"Calendar/Notes/This Year" and #calendar/month').where(p => {
		return currentQuarterMonths.contains(p.date.c.month);
	});

	let weeks = dv.pages('"Calendar/Notes/This Year" and #calendar/week').where(p => {
        let fn;
        // cases where a week has days in either month (i.e. first day of march may be in the last week of feb)
        if (Array.isArray(p.month)) {
            return p.month.some(m => {
                fn = m.path.split("/").pop();
                // get the month the week is in by the month note it's pointing to
                // month note has the format: YYYY-MM
                return currentQuarterMonths.contains(Number(fn.match(/-([\d]+)/)[1]));
            });
        } else {
            fn = p.month.path.split("/").pop();
            return currentQuarterMonths.contains(Number(fn.match(/-([\d]+)/)[1]));
        }
	});

    // display each month in current quarter and its corresponding weeks
	months.values.forEach(m => {
		const listRoot = dv.el("ul", "");
		dv.el("li", `[[${m.file.name}]]`, {container: listRoot});
		const nestedListRoot = dv.el("ul", "", {container: listRoot});
        const wl = [];
		weeks.values.forEach(w => {
			// check if week is in the month by checking week's link
            
            // case where a week has days in either month
            if (Array.isArray(w.month)) {
                const m_num = Number(m.file.name.match(/-([\d]+)/)[1]);
                const wm_num = Number(w.file.name.match(/-([\d]+)-/)[1]);
                if (w.month.some(wm => wm.path == m.file.link.path) && wm_num == m_num) {
                    wl.push(`[[${w.file.name}]]`);
                }
            }
            else { 
                if (w.month.path == m.file.link.path) {
                    wl.push(`[[${w.file.name}]]`);
                }
            }
		});
        wl.sort();
        wl.forEach(wfn => {
            dv.el("li", `${wfn}`, {container: nestedListRoot});
        })
	});	
}

// Render past quarters
if (currY > y) {
	q = 5;
}

dv.span(`## Past Quarters`);

if (q > 1) {
	[...Array(q-1).keys()].forEach(i => {
		const listRoot = dv.el("ul", "");
		dv.el("li", `[[${y} - Q${i+1}]]`, {container: listRoot});

		// months
		const nestedListRoot = dv.el("ul", "", {container: listRoot});
		qm[i].forEach(pm => {
			dv.el("li", `[[${y}-${('0'+pm).slice(-2)}]]`, {container: nestedListRoot});
		});
	});
}

