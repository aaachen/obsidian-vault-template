const { Goal, Time } = await cJS();

let { sleepTimeGoal } = Goal.getSleepTimeGoals();
function hasSleptOnTime(p) {
  let bedTime = p.sleep ? moment(p.sleep, "HH:mm") : undefined;
  // backward compatibility, used to do the math manually
  if (bedTime) {
    if (bedTime.hour() >= 13 && bedTime.hour() < 24) {
      bedTime = bedTime.subtract(1, 'days')
    }
    return bedTime.isSameOrBefore(sleepTimeGoal)
      || bedTime.diff(sleepTimeGoal, "hours", true) <= 0.6; // bedtime is after goal, check if it's within about half and hour
  }
  return p.sleepTime >= 4.5;
}

let config = Goal.getMealTimeGoals();
function hasEatenOnTime(p) {
  // backward compatibility, used to do the math manually
  if (p.lunch && p.dinner) {
    let pastHours = Goal.getHoursPastMealTimeGoal(p, config)
    return pastHours <= 3;
  }
  return p.mealTime >= 7;
}

const pages = dv
  .pages('"Calendar/Notes/This Year" and #calendar/day')
  .sort((p) => p.file.day, "desc")
  .map((p) =>
    Object.create({
      link: p.file.link,
      day: p.file.day,
      SleepOnTime: hasSleptOnTime(p),
      EatOnTime: hasEatenOnTime(p),
    })
  );

// get longest consecutive streak
function getStreak(validate) {
  let longestCount = 0;
  let count = 0;
  let prevDate = undefined;
  for (const note of pages) {
    if (validate(note)) {
      if (!prevDate) {
        // initial count
        count++;
      } else {
        // check if current day is a continuation of streak (account for case where daily notes are not created consecutively)
        if (note.day.plus({ days: 1 }).toISODate() == prevDate.toISODate()) {
          count++;
        } else {
          // streak broken
          longestCount = Math.max(longestCount, count);
          count = 1;
        }
      }
      prevDate = note.day;
    } else {
      // streak broken
      longestCount = Math.max(longestCount, count);
      count = 0;
    }
  }
  return longestCount;
}

function getRecord(validate) {
  let count = 0;
  for (const note of pages) {
    if (validate(note)) {
      count++;
    }
  }
  return count;
}

const done = "✅";
const skip = "🟥";
const fileRows = pages
  // Get latest five days to minimize screen size
  .filter((p) => p.day >= moment().subtract(5, "d"))
  .sort((p) => p.day)
  .map((note) => [
    dv.fileLink(note.link.path, false, note.day.toFormat('ccc, LLL d')),
    note.SleepOnTime ? done : skip,
    note.EatOnTime ? done : skip,
  ]);
const slept = [
  getStreak((note) => note.SleepOnTime),
  getRecord((note) => note.SleepOnTime),
];
const eat = [
  getStreak((note) => note.EatOnTime),
  getRecord((note) => note.EatOnTime),
];
dv.table(
  ["Days", "按時睡覺", "准時吃飯"],
  [
    ...fileRows,
    ["‎"],
    ["**Streak**", slept[0], eat[0]],
    ["**Total**", slept[1], eat[1]],
  ]
);
