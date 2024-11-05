const { Common } = await cJS();

let renderWeekTotalExercise = (args) => {
    const {
        dv,
    } = args;

    const dayNotes = dv.pages(`"Calendar/Notes/This Year" and #calendar/day`);

    const daysExercised = {
    	year: 2024,
        showCurrentDayBorder: true,
        defaultEntryIntensity: 4,
        entries: [],
    }
	const weeksExerciseAmount = {};
	for (let d of dayNotes) {
        // heatmap (intensity by exercises done)
    	let cd = d.created.toFormat("yyyy-MM-dd");
    	if (d.exercise) {
    		// Alternative: intensity by the max RPE per day.
    		let times = Common.toArray(d.exercise).length
    		daysExercised.entries.push({
    			date: cd,
    			intensity: times
    		})
    	}
        
        // total exercise/workouts done in year, group by week
		let w = d.week.path.split("/").pop().replace(".md", "")
        if (w) {
			let wamt = weeksExerciseAmount[w];
			if (!wamt) {
                weeksExerciseAmount[w] = 0;
			}
        }
		if (d.exercise && w) {
			let wamt = weeksExerciseAmount[w];
			weeksExerciseAmount[w] = wamt + 1;
		}
	}
	
    dv.span('### Exercises per day');
    renderHeatmapCalendar(input.context.container, daysExercised);
    
    const target = dv.current().daysExercisedPerWeekTarget
    dv.span('<br/><br/>');
    dv.span('### Days exercised per week');
    dv.paragraph(`\`\`\`chart
    type: line 
    labels: [${Object.keys(weeksExerciseAmount).map(i => `"${i}"`).join(",")}]
    series:
        - data: [${Object.values(weeksExerciseAmount).join(",")}]
          label: 'Days Exercised Per Week'
          backgroundColor: 'rgba(255, 211, 101, 0.2)'
	      borderColor: 'rgba(255, 211, 101, 1)'
          tension: 0.2
          fill: true
        - data: [${Object.values(weeksExerciseAmount).map(_ => target).join(",")}]
          label: 'Target'
          backgroundColor: 'rgba(143, 208, 50, 0.2)'
          borderColor: 'rgba(143, 208, 50, 1)'
          tension: 0.2
          fill: false
    beginAtZero: true
\`\`\``)
}

renderWeekTotalExercise({
	dv
});

