const { Time, Common } = await cJS();
let renderMealtimeChart = (args) => {
    const {
        dv,
        template = {
            label: "Default",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            // borderColor: 'rgb(75, 192, 192)',
            fill: false, 
            borderWidth: 1,
            tension: 0.2,
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
        .filter((p) => p.lunch || p.dinner || p.breakfast)
        .sort((p) => p.created, "asc");

    const chartData = [];
    for (const day of days) {
        let breakfast = day.breakfast ? Time.getHours(moment(day.breakfast, "HH:mm")) : undefined;
        let lunch = day.lunch ? Time.getHours(moment(day.lunch, "HH:mm")) : undefined;
        let dinner = day.dinner ? Time.getHours(moment(day.dinner, "HH:mm")) : undefined;
        chartData.push({
            date: day.created.toFormat("yyyy-MM-dd"), // Date for x-axis
            breakfast,
            lunch,
            dinner
        });
    }
    const labels = chartData.map((point) => point.date);
    // Ideal meal time, can also query from page itself
    const idealBreakfastLineData = Array(chartData.length).fill(10);
    const idealLunchLineData = Array(chartData.length).fill(13);
    const idealDinnerLineData = Array(chartData.length).fill(19);

    const datasets = {
        breakfast: Object.assign({}, template, {
            label: "Breakfast",
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            data: chartData.map((point) => ({
                x: point.date,
                y: point.breakfast,
            })),
        }),
        idealBreakfastLine: Object.assign({}, lineAnnotationTemplate, {
            label: "Ideal (10:00)",
            borderColor: 'rgb(245, 195, 88)',
            data: idealBreakfastLineData,
        }),
        lunch: Object.assign({}, template, {
            label: "Lunch",
            borderColor: 'rgb(117, 217, 124)',
            backgroundColor: 'rgba(117, 217, 124, 0.6)',
            data: chartData.map((point) => ({
                x: point.date,
                y: point.lunch,
            })),
        }),
        idealLunchLine: Object.assign({}, lineAnnotationTemplate, {
            label: "Ideal (13:00)",
            borderColor: 'rgb(160, 245, 115)',
            data: idealLunchLineData,
        }),
        dinner: Object.assign({}, template, {
            label: "Dinner",
            borderColor: 'rgb(181, 80, 80)',
            backgroundColor: 'rgba(181, 80, 80, 0.6)',
            data: chartData.map((point) => ({
                x: point.date,
                y: point.dinner,
            })),
        }),
        idealDinnerLine: Object.assign({}, lineAnnotationTemplate, {
            label: "Ideal (19:00)",
            borderColor: 'rgb(252, 126, 126)',
            data: idealDinnerLineData,
        }),
    };

    const finalChartData = {
        type: "line", 
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
                    ticks: {
                        callback: Time.getHourAndMinute,
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const time = context.raw.y;
                            return Time.getHourAndMinute(time);
                        },
                    },
                },
            },
        },
    };
    window.renderChart(finalChartData, container);

    // Annotations
    const breakfasts = chartData.map(d => d.breakfast);
    const skippedBreakfasts = breakfasts.filter(b => !b);
    const avgBreakfastTime = Time.circularMean(chartData.map(d => d.breakfast));
    const avgLunchTime = Time.circularMean(chartData.map(d => d.lunch));
    const avgDinnerTime = Time.circularMean(chartData.map(d => d.dinner));
    dv.paragraph(`
Avg Breakfast Time: **${Time.getHourAndMinute(avgBreakfastTime)}**, skipped **${skippedBreakfasts.length}** times
Avg Lunch Time: **${Time.getHourAndMinute(avgLunchTime)}**
Avg Dinner Time: **${Time.getHourAndMinute(avgDinnerTime)}**`);
};

renderMealtimeChart({
    dv,
    container: input.context.container,
});
