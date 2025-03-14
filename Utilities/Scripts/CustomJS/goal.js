// TODO: This should really be renamed as "habits", I'm not doing goals, only log (for what I have accomplished)
// Handle abstraction for common goals defined in files
class Goal {
  constructor() {
    this.dvApi = app.plugins.plugins["dataview"].api;
    const generalHealthPath = "Atlas/Special/Views/🫒 Sleep & Diet";
    this.goals = new Map([
      [
        "SleepTime",
        {
          path: generalHealthPath,
          goalKey: "sleep",
        },
      ],
      [
        "WakeTime",
        {
          path: generalHealthPath,
          goalKey: "wake",
        },
      ],
      [
        "BreakfastTime",
        {
          path: generalHealthPath,
          goalKey: "breakfast",
        },
      ],
      [
        "LunchTime",
        {
          path: generalHealthPath,
          goalKey: "lunch",
        },
      ],
      [
        "DinnerTime",
        {
          path: generalHealthPath,
          goalKey: "dinner",
        },
      ],
    ]);
  }

  getGoal(goalName) {
    const config = this.goals.get(goalName);
    if (!config) {
      throw new Error(`Goal '${goalName}' not found`);
    }
    const { path, goalKey } = config;
    const page = this.dvApi.page(path);
    return page[goalKey];
  }

  getSleepTimeGoals() {
    let sleepTimeGoal = moment(this.getGoal("SleepTime"), "HH:mm");
    let wakeTimeGoal = moment(this.getGoal("WakeTime"), "HH:mm");
    let sleepHoursGoal = wakeTimeGoal.diff(sleepTimeGoal, "hours", true);
    return {
      sleepTimeGoal: sleepTimeGoal,
      wakeTimeGoal: wakeTimeGoal,
      sleepHoursGoal: sleepHoursGoal,
    };
  }

  // TODO: pending interface
  getHoursPastSleepTimeGoal(p, config) {
    let sleepTime = p.sleep ? moment(p.sleep, "HH:mm") : undefined;
    let { sleepTimeGoal } = config ? config : this.getSleepTimeGoals();
    // sleep time is in evening
    if (sleepTime.hour() >= 12 && sleepTime.hour() < 24) {
      sleepTime = sleepTime.subtract(1, 'days');
    }
    let pastHours = this.ramp(sleepTime.diff(sleepTimeGoal, "hours", true));
    return pastHours;
  }

  getMealTimeGoals() {
    let breakfastTimeGoal = moment(this.getGoal("BreakfastTime"), "HH:mm");
    let lunchTimeGoal = moment(this.getGoal("LunchTime"), "HH:mm");
    let dinnerTimeGoal = moment(this.getGoal("DinnerTime"), "HH:mm");
    // Just some default value for "X hours past goal" when I skip meals, technically it should be undefined
    let breakfastToLunch = lunchTimeGoal.diff(breakfastTimeGoal, "hours", true);
    let lunchToDinner = dinnerTimeGoal.diff(lunchTimeGoal, "hours", true);
    let dinnerToTen = moment("22:00", "HH:mm").diff(
      dinnerTimeGoal,
      "hours",
      true
    );
    return {
      breakfastTimeGoal: breakfastTimeGoal,
      lunchTimeGoal: lunchTimeGoal,
      dinnerTimeGoal: dinnerTimeGoal,
      pastBreakfast: breakfastToLunch,
      pastLunch: lunchToDinner,
      pastDinner: dinnerToTen,
    };
  }

  // utility
  ramp(v) {
    return v < 0 ? 0 : v;
  }

  getHoursPastMealTimeGoal(p, config) {
    let breakfastTime = p.breakfast ? moment(p.breakfast, "HH:mm") : undefined;
    let lunchTime = p.lunch ? moment(p.lunch, "HH:mm") : undefined;
    let dinnerTime = p.dinner ? moment(p.dinner, "HH:mm") : undefined;
    // Edge case: midnight dinner
    if (dinnerTime && dinnerTime.hour() > 0 && dinnerTime.hour() < 6) {
      dinnerTime = dinnerTime.add(1, 'days');
    }

    let {
      breakfastTimeGoal,
      lunchTimeGoal,
      dinnerTimeGoal,
      pastBreakfast,
      pastLunch,
      pastDinner,
    } = config ? config : this.getMealTimeGoals();

    let pastHours = 0;
    pastHours += breakfastTime
      ? this.ramp(breakfastTime.diff(breakfastTimeGoal, "hours", true))
      : pastBreakfast;
    pastHours += lunchTime
      ? this.ramp(lunchTime.diff(lunchTimeGoal, "hours", true))
      : pastLunch;
    pastHours += dinnerTime
      ? this.ramp(dinnerTime.diff(dinnerTimeGoal, "hours", true))
      : pastDinner;

    return pastHours;
  }
}
