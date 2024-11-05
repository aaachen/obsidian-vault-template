let renderWeeklyChart = (args) => {
  const {
    dv,
    dayFormat = "yyyy-MM-DD - ddd MMM D",
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
  const yearName = dv.current().file.folder.split("/").pop();
  const year =
    yearName == "This Year" ? new Date().getFullYear() : parseInt(yearName);
  const daysPath = `"Calendar/Notes/${yearName}" and #calendar/day`;

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

  const days = dv
    .pages(daysPath)
    .where((p) => p.created >= start && p.created <= end);

  // TODO: instead of find, use hashmap for more efficient lookup...
  // hold array of dv day page objects, if the given day page is not created, replace with placeholder object
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
        if (props.average) {
          return (p[attr] / props.average) * 10;
        } else {
          return p[attr];
        }
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
  };
  window.renderChart(chartData, input.context.container);
};

const { Goal } = await cJS();
let sleepTimeGoals = Goal.getSleepTimeGoals();
let dietTimeGoals = Goal.getDietTimeGoals();
const attributes = {
  proud: {
    label: "Proud",
    backgroundColor: "rgba(255, 211, 101, 0.2)",
    borderColor: "rgba(255, 211, 101, 1)",
    average: 5,
  },
  sleepHours: {
    label: "Sleep Hours",
    backgroundColor: "rgba(85, 174, 229, 0.2)",
    borderColor: "rgba(85, 174, 229, 1)",
    compute: (p) => {
      let sleepTime = p.sleep ? moment(p.sleep, "HH:mm") : undefined;
      let wakeTime = p.wake ? moment(p.wake, "HH:mm") : undefined;
      if (sleepTime && wakeTime) {
        return wakeTime.diff(sleepTime, "hours", true);
      }
      // backward compatibility, used to do the math manually
      return p.sleepHours ?? 0;
    },
  },
  sleepTime: {
    label: "Hours past sleep schedule",
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
  dietTime: {
    label: "Hours past eat schedule",
    backgroundColor: "rgba(141, 82, 188, 0.2)",
    borderColor: "rgba(141, 82, 188, 1)",
    compute: (p) => {
      if (p.lunch && p.dinner) {
        return Goal.getHoursPastDietTimeGoal(p, dietTimeGoals);
      }
      // backward compatibility, used to do the math manually
      return 10 - p.dietTime;
    },
  },
};

renderWeeklyChart({
  dv,
  attributes,
});
