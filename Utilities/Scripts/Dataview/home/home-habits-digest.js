/**
 * The habit digest widget, tracking the effect of habits rather than any explicit goals
 */
const { Time, Common } = await cJS();

const yearPath = "Calendar/Notes/This Year";
const currentYear = new Date().getFullYear();

const booksReadThisYear = dv.pages('#book')
  .where(p => (Common.toArray(p.yearXPL) ?? []).includes(currentYear.toString()))
  .length;

const weight = getCurrentWeight();

const today = dv.date("today");
const sevenDaysAgo = today.minus({ days: 7 });
const relevantPages = dv.pages('"Calendar/Notes/This Year" and #calendar/day')
  .where(p => p.created >= sevenDaysAgo && p.created < today)
  .sort(p => p.created, "desc");

const sleepTimes = [];
const sleepHours = [];
const lunchTimes = [];
const dinnerTimes = [];
let skippedBreakfasts = 0;

relevantPages.forEach(page => {
  if (page.sleep) sleepTimes.push(Time.getHours(moment(page.sleep, "HH:mm")));
  if (page.sleep && page.wake) {
      const sleepTime = moment(page.sleep, "HH:mm");
      const wakeTime = moment(page.wake, "HH:mm");
      const duration = Math.abs(wakeTime.diff(sleepTime, "hours", true));
      sleepHours.push(duration);
  }
  if (page.lunch) lunchTimes.push(Time.getHours(moment(page.lunch, "HH:mm")));
  if (page.dinner) dinnerTimes.push(Time.getHours(moment(page.dinner, "HH:mm")));
  if (!page.breakfast) skippedBreakfasts++;
});

const averageSleepHours = average(sleepHours);
const averageSleepTime = Time.getHourAndMinute(Time.circularMean(sleepTimes));
const averageLunchTime = Time.getHourAndMinute(Time.circularMean(lunchTimes));
const averageDinnerTime = Time.getHourAndMinute(Time.circularMean(dinnerTimes));

dv.paragraph(`#### 📰 Digest
- 📖 I have read **${booksReadThisYear}** [[Books|books]] so far
- 🐔 I [[Workout Map#Weight|weigh]] about **${weight}** lbs
- 🛏️ I averaged **${averageSleepHours}** hours of [[🫒 Sleep & Diet#Sleep Trend|sleep]] and bed time at around **${averageSleepTime}** in the past 7 days
- 🍽️ I've been [[🫒 Sleep & Diet#Meal Time|eating]] lunch at around **${averageLunchTime}** and dinner at **${averageDinnerTime}**. Skipped breakfasts **${skippedBreakfasts}** times
`);

function getCurrentWeight() {
  const weekNum = Number(moment().format("ww"));
  let latestWeek = undefined;
  let i = 0;
  while (weekNum - i > 0) {
    latestWeek = dv.page(`${yearPath}/${moment().subtract(7 * i, 'd').format("YYYY-MM-[w]ww")}`);
    if (latestWeek && latestWeek.weight) break;
    i++;
  }
  return (latestWeek && latestWeek.weight) ? latestWeek.weight : NaN;
}

function average(numbers) {
  return numbers.length > 0 ? (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(2) : undefined;
}
