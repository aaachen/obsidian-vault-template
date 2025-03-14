const { Time, Common } = await cJS();
let renderSleepChart = (args) => {
    const {
        dv,
        template = {
            label: "Sleep Duration",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: true,
        },
        lineAnnotationTemplate = {
            borderColor: "yellow", // Color of the line
            borderWidth: 2, // Thicker line
            fill: false,  // No fill, just a line
            tension: 0,   // Set to 0 for a straight line
            type: 'line', // Specify that this is a line chart
            pointRadius: 0, // No points on the line
            borderDash: [5, 5],
        },
        container
    } = args;

    const daysPath = `"${Common.getYearFolderPath(input.year)}" and #calendar/day`
    const days = dv.pages(daysPath)
        .sort((p) => p.created, "asc")
        .filter((p) => p.sleep && p.wake);

    const chartData = [];
    for (const day of days) {
        let bedTime = moment(day.sleep, "HH:mm");
        let wakeTime = moment(day.wake, "HH:mm");
        // Convert to decimal representation for graphing
        // - could possibly use Time Cartesian Axis, but there's some issue with it on y axis
        const wakeTimeNum = Time.getHours(wakeTime);
        // if bedTime is after wakeTime (i.e. bedTime 22:00 after wakeTime 06:00), then that must means bedTime is from a previous day
        const isBedTimeDayBefore = bedTime.isAfter(wakeTime)
        const bedTimeNum = Time.getHours(bedTime, isBedTimeDayBefore);
        if (isBedTimeDayBefore) {
            bedTime = bedTime.subtract(1, "days")
        }
        const duration = Math.abs(wakeTime.diff(bedTime, "hours", true)); // keep decimal place
        chartData.push({
            date: day.created.toFormat("yyyy-MM-dd"), // Date for x-axis
            bedTimeNum,
            wakeTimeNum,
            duration,      // For toolbar
        });
    }
    const labels = chartData.map((point) => point.date);
    const idealSleepLineData = Array(chartData.length).fill(1); // 1.0 for ideal sleep time (01:00)
    const idealWakeLineData = Array(chartData.length).fill(9); // 9.0 for ideal sleep time (09:00)
    const datasets = {
        sleepDuration: Object.assign({}, template, {
            label: "Sleep Duration",
            data: chartData.map((point) => ({
                x: point.date,
                y: [point.bedTimeNum, point.wakeTimeNum],
                duration: point.duration,
            })),
        }),
        idealSleepLine: Object.assign({}, lineAnnotationTemplate, {
            label: "Ideal Sleep Time (01:00)",
            data: idealSleepLineData, // Same value for every x (constant line)
        }),
        idealWakeLine: Object.assign({}, lineAnnotationTemplate, {
            label: "Ideal Wake Time (09:00)",
            data: idealWakeLineData, // Same value for every x (constant line)
        }),
    };

    const finalChartData = {
        type: "bar",
        data: {
            labels: labels,
            datasets: Object.values(datasets),
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "category",  // x-axis is categorical (dates)
                },
                y: {
                    reverse: true,
                    ticks: {
                        callback: Time.getHourAndMinute,
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const sleepStart = context.raw.y[0]; // Get start time of the bar (sleep time)
                            const sleepEnd = context.raw.y[1];   // Get end time of the bar (wake time)
                            const duration = Math.round(context.raw.duration * 10) / 10;
                            return `Sleep: ${Time.getHourAndMinute(sleepStart)} - ${Time.getHourAndMinute(sleepEnd)}. Hours: ${duration}`;
                        },
                    },
                },
            },
        },
    };
    window.renderChart(finalChartData, container);

    // Annotations
    const totalDuration = chartData.reduce(((acc, d) => acc += d.duration), 0);
    const avgDuration = totalDuration / days.length;
    const avgBedTime = Time.circularMean(chartData.map(d => d.bedTimeNum));
    dv.paragraph(`Avg Bed Time: **${Time.getHourAndMinute(avgBedTime)}**\nAvg Sleep Hours: **${avgDuration.toFixed(2)}**`);
};

renderSleepChart({
    dv,
    container: input.context.container,
});
