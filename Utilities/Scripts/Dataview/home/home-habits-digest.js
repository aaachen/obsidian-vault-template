/**
 * The habit digest widget, tracking the effect of habits rather than any explicit goals
 */
const { Time, Common } = await cJS();

const yearPath = "Calendar/Notes/This Year";
const currentYear = new Date().getFullYear();

const booksThisYear = dv.pages('#book')
  .where(p => (Common.toArray(p.yearXPL) ?? []).includes(currentYear.toString()));

let booksReading = booksThisYear.where(p => (Common.toArray(p.tags) ?? []).some(tag => tag === "book/reading"));
booksReading = booksReading.values.map(b => `[[${b.file.name}]]`).reduce((acc, cur, i) =>
  acc + (i === 0 ? '' : i === arr.length - 1 ? ', and ' : ', ') + cur, '');
const booksFinished = booksThisYear.where(p => (Common.toArray(p.tags) ?? []).some(tag => tag === "book")).length;

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
const currentlyReading = booksReading ? `Current book: *${booksReading}*. ` : "";

dv.paragraph(`#### 📰 Digest
- 📖 ${currentlyReading}I've read **${booksFinished}** [[Books|book${booksFinished > 1 ? "s" : ""}]] this year. 
- 🛌 I averaged **${averageSleepHours}** hours of [[🫒 Sleep & Diet#Sleep Trend|sleep]] and bed time at around **${averageSleepTime}** in the past 7 days
- 🍽️ I've been [[🫒 Sleep & Diet#Meal Time|eating]] lunch at around **${averageLunchTime}** and dinner at **${averageDinnerTime}**. Skipped breakfasts **${skippedBreakfasts}** times
`);

function average(numbers) {
  return numbers.length > 0 ? (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(2) : undefined;
}

