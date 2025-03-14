const { Time, Common } = await cJS();
/**
 * Weight trend that accepts weight logged weekly, skipps null data
 * - TODO: file source option, and use the csv export from happy scale for daily
 */
let renderWeightChart = (args) => {
    const {
        dv,
        template = {
            label: "Default",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgb(255, 99, 132)",
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

    const weekPath = `"${Common.getYearFolderPath(input.year)}" and #calendar/week`
    const weeks = dv.pages(weekPath)
        .filter((p) => p.weight)
        .sort((p) => p.created, "asc");
    const chartData = [];
    for (const week of weeks) {
        chartData.push({
            week: week.file.name,
            weight: week.weight
        })
    }
    const labels = chartData.map((point) => point.week);
    // Ideal weight
    const idealWeight = 140;
    const idealWeightLineData = Array(chartData.length).fill(idealWeight);
    const datasets = {
        weight: Object.assign({}, template, {
            label: "Weight",
            data: chartData.map((point) => ({
                x: point.week,
                y: point.weight,
            })),
        }),
        idealWeightLine: Object.assign({}, lineAnnotationTemplate, {
            label: `Ideal (${idealWeight} lbs)`,
            data: idealWeightLineData,
            hidden: true,
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
                    type: "category",
                }
            },
        },
    };
    window.renderChart(finalChartData, container);
};

renderWeightChart({
    dv,
    container: input.context.container,
});
