let renderDailyMetricsLineChart = (args) => {
  const {
    dv,
    template = {
      label: "Default",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
      fill: true,
      tension: 0.2,
    },
    attributes,
  } = args;
  const current = dv.current();
  const yearName = current.file.folder.split("/").pop();
  const year = yearName == "This Year" ? new Date().getFullYear() : parseInt(yearName);

  let isMonth = input.isMonth;
  let start, end, len;
  if (isMonth) {
    // month
    let month = input.month;
    let monthstr = month < 10 ? "0" + month : `${month}`;
    len = new Date(year, month, 0).getDate();
    start = dv.date(`${year}-${monthstr}-01`);
    end = dv.date(`${year}-${monthstr}-${len}`);
  } else {
    // week
    len = 7;
    start = dv.date(`${input.startOfWeekDate}`);
    end = dv.date(`${input.endOfWeekDate}`);
  }

  // Using inlinks here to account for edge cases in week that span across two years, alternative is to query the notes
  // const daysPath = `"Calendar/Notes/${yearName}" and #calendar/day`
  const days = dv
    .pages(`[[${current.file.path}]]`)
    .where(p => {
      let isDailyNote = false;
      if (Array.isArray(p.tags)) {
        isDailyNote = p.tags.some(tag => tag.includes("calendar/day"))
      }
      return isDailyNote && p.created >= start && p.created <= end
    });


  const daysWithEmpty = Array.from({ length: len }, (_, i) => {
    const currd = start.plus(dv.duration(`${i} d`));
    const d = days.values.find(
      (d) => d.created.toISODate() == currd.toISODate()
    );
    return d ? d : { created: currd };
  });

  const getData = (attr, props) =>
    daysWithEmpty.map(
      // out of ten only
      (p) => {
        if (props.compute) {
          return props.compute(p);
        }
        if (!p[attr]) {
          return 0;
        }
        return p[attr];
      }
    );
  let datasets = {};

  for (let [attr, props] of Object.entries(attributes)) {
    datasets[attr] = Object.assign({}, template, props, {
      data: getData(attr, props),
    });
  }

  const labels =
    len == 7
      ? [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]
      : daysWithEmpty.map((d) => d.created.toISODate());

  const chartData = {
    type: "line",
    data: {
      labels: labels,
      datasets: Object.values(datasets),
    },
    options: {
      scales: {
        y: {
          position: "left",
          min: 0,
        },
        yRight: {
          suggestedMax: 5,
          suggestedMin: 0,
          position: "right"
        }
      }
    }
  };
  window.renderChart(chartData, input.context.container);
};

const { Goal } = await cJS();
let sleepTimeGoals = Goal.getSleepTimeGoals();
let mealTimeGoals = Goal.getMealTimeGoals();
const attributes = {
  sleepHours: {
    label: "Sleep hours",
    backgroundColor: "rgba(85, 174, 229, 0.2)",
    borderColor: "rgba(85, 174, 229, 1)",
    compute: (p) => {
      let sleepTime = p.sleep ? moment(p.sleep, "HH:mm") : undefined;
      let wakeTime = p.wake ? moment(p.wake, "HH:mm") : undefined;
      if (sleepTime && wakeTime) {
        let hours = wakeTime.diff(sleepTime, "hours", true);
        if (hours < 0) {
          hours += 24;
        }
        return hours
      }
      // backward compatibility, used to do the math manually
      return p.sleepHours ?? 0;
    },
  },
  sleepTime: {
    label: "Hours past bedtime",
    backgroundColor: "rgba(255, 99, 132, 0.2)",
    borderColor: "rgba(255, 99, 132, 1)",
    compute: (p) => {
      if (p.sleep) {
        return Goal.getHoursPastSleepTimeGoal(p, sleepTimeGoals);
      }
      // backward compatibility, used to do the math manually
      return p.sleepTime ? 5 - p.sleepTime : 0;
    },
  },
  mealTime: {
    label: "Hours past mealtime",
    backgroundColor: "rgba(141, 82, 188, 0.2)",
    borderColor: "rgba(141, 82, 188, 1)",
    compute: (p) => {
      if (p.breakfast || p.lunch || p.dinner) {
        return Goal.getHoursPastMealTimeGoal(p, mealTimeGoals);
      }
      // backward compatibility, used to do the math manually
      return 10 - p.mealTime;
    },
  },
};

renderDailyMetricsLineChart({
  dv,
  attributes,
});
