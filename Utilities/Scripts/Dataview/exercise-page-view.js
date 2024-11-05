const { Common } = await cJS();

/**
 * Render graph in exercise view
 * - Best Set
 */

const template = {
  label: "Default",
  backgroundColor: "rgba(255, 211, 101, 0.2)",
  borderColor: "rgba(255, 211, 101, 1)",
  borderWidth: 1,
  fill: false,
  tension: 0.2,
};

/**
 * Get the PR Metric of given exercise records
 * The prMetricSetting determines which is "best" used
 */
let getPrRecord = (prMetricSetting, records) => {
  let result = {};
  if (prMetricSetting == "max rep") {
    result = records.reduce(
      (prevMax, current) => (current.reps > prevMax.reps ? current : prevMax),
      { reps: -Infinity }
    );
    result["pr"] = result.reps;
  } else {
    throw new Error(`unrecognized prMetricSetting ${prMetricSetting}`);
  }
  return result;
};

let renderExerciseView = (args) => {
  const { dv } = args;

  let exerciseName = dv.current().file.name;
  let prMetricSetting = dv.current().prMetric;
  let displayRPE = dv.current().displayRPE;
  let goal = dv.current().goal;
  let prMetrics = {};
  let rpes = [];

  const dayNotes = dv.pages(`"Calendar/Notes/This Year" and #calendar/day`);

  for (let d of dayNotes) {
    if (d.exercise) {
      let exercises = Common.toArray(d.exercise);
      let records = Common.toArray(d.record).map(
        (r) => JSON.parse(r)
      );
      let exerciseRecords = exercises
        .map((e, i) => {
          return { exercise: e, ...records[i] };
        })
        .filter((r) => r.exercise == exerciseName);
      let prRecord = getPrRecord(prMetricSetting, exerciseRecords);
      prMetrics[d.created.toISODate()] = prRecord["pr"];
      if (displayRPE) {
        rpes.push(prRecord["rpe"]);
      }
    }
  }

  let datasets = {
    labels: Object.keys(prMetrics),
    datasets: [
      // best set data
      Object.assign({}, template, {
        label: `Best Set (${prMetricSetting.replace(/\b\w/g, (c) =>
          c.toUpperCase()
        )})`,
        data: Object.values(prMetrics),
        yAxisID: "y",
      }),
    ],
  };

  if (displayRPE) {
    datasets.datasets.push(
      Object.assign({}, template, {
        label: "RPE",
        data: rpes,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        yAxisID: "y1",
      })
    );
  }

  let bestSetGoal = goal
    ? goal.find((g) => g.graph == "bestSet").value
    : undefined;
  if (bestSetGoal) {
    datasets.datasets.push(
      Object.assign({}, template, {
        label: "Goal",
        data: Object.values(prMetrics).map((_) => bestSetGoal),
        backgroundColor: "rgba(143, 208, 50, 0.2)",
        borderColor: "rgba(143, 208, 50, 1)",
        yAxisID: "y",
      })
    );
  }

  // yScaleText plugin block
  const yScaleText = {
    id: "yScaleText",
    afterDatasetsDraw(chart, args, options) {
      const {
        ctx,
        chartArea: { top },
        scales: { x, y },
      } = chart;
      ctx.save();
      ctx.font = `${options.fontSize}px Arial`;
      ctx.fillStyle = options.fontColor;
      ct.fillText("Y Scale Title", 0, top - 15);
      ctx.restore();
    },
  };

  let scales = {
    y: {
      title: {
        display: true,
        text: "Best Set",
      },
      grace: 1,
      type: "linear",
      display: true,
      position: "left",
    },
    y1: {
      title: {
        display: true,
        text: "RPE",
      },
      min: 1,
      max: 10,
      type: "linear",
      display: true,
      position: "right",
      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  };

  if (!displayRPE) {
    scales.y1.display = false;
  }

  dv.span("### Best Set");
  const chartData = {
    type: "line",
    data: datasets,
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      layout: {
        padding: -5,
      },
      plugins: {
        yScaleText: {
          fontSize: 20,
          fontColor: "rgba (255, 26, 104, 1)",
          title: "test",
        },
      },
      scales: scales,
    },
  };
  window.renderChart(chartData, input.context.container);
};

renderExerciseView({
  dv,
});

