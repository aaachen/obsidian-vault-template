let renderWeeklyChart = (args) => {
  const { dv, daysPath = '""' } = args;

  const datasets = (() => {
    const startOfWeek = dv.date(`${input.startOfWeekDate}`);
    const endOfWeek = dv.date(`${input.endOfWeekDate}`);
    const weeklydays = dv
      .pages(daysPath)
      .where((p) => p.created >= startOfWeek && p.created <= endOfWeek);

    const enameDaysMap = {};
    const enameDescMap = {};
    weeklydays.values.forEach((wkd) => {
      if (wkd.ename) {
        let enames = wkd.ename,
          desc = wkd.desc;
        let dayName = moment(wkd.created.toISODate()).format("ddd");
        if (typeof enames == "string") enames = [enames];
        if (typeof desc == "string") desc = [desc];
        if (enames.length != desc.length) {
          throw new Error(
            `Efforts=${enames} does not have corresponding descriptions=${desc} in file=[${wkd.file.name}]`
          );
        }
        // used to detect duplicate logged effort and combine descriptions in case there is
        let dayEnameDescMap = {};
        enames.forEach((en, i) => {
          if (dayEnameDescMap[en]) {
            // merging descriptions
            dayEnameDescMap[en] += `; ${desc[i]}`;
          } else {
            dayEnameDescMap[en] = `[[${wkd.file.name}|${dayName}]]: ${desc[i]}`;
          }
        });
        for (const [en, desc] of Object.entries(dayEnameDescMap)) {
          if (enameDaysMap[en]) {
            enameDaysMap[en] += 1;
            enameDescMap[en].push({
              day: wkd.created.weekday,
              desc: desc,
            });
          } else {
            enameDaysMap[en] = 1;
            enameDescMap[en] = [
              {
                day: wkd.created.weekday,
                desc: desc,
              },
            ];
          }
        }
      }
    });
    return { chart: enameDaysMap, table: enameDescMap };
  })();
  dv.paragraph(`\`\`\`chart
    type: pie
    labels: [${Object.keys(datasets.chart)
      .map((i) => `"${i}"`.replaceAll("[[", "").replaceAll("]]", ""))
      .join(",")}]
    series:
        - data: [${Object.values(datasets.chart).join(",")}]
    width: 40%
    labelColors: true
\`\`\``);

  dv.table(
    ["Effort", "Description"],
    Object.entries(datasets.table).map(([ename, days]) => {
      days.sort((a, b) => a.day - b.day);
      let description = days.reduce((acc, d) => acc + `\n\n${d.desc}`, "");
      return [ename, description];
    })
  );
};

const year = dv.current().file.folder.split("/").pop();
renderWeeklyChart({
  dv,
  daysPath: `"Calendar/Notes/${year}" and #calendar/day`,
});
