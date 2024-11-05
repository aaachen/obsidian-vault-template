// Handle abstraction for common goals defined in files

// TODO: Define better interface of measurement against goal (current measurement pass from a page file)
class Goal {
  constructor() {
    this.dvApi = app.plugins.plugins["dataview"].api;
    const generalHealthPath = "Atlas/+ Maps/🫒 Sleep & Diet";
    const exercisePath = "Atlas/+ Maps/⛹🏽 Workout & Exercise";
    const gainWeightPath = "Atlas/+ Maps/🍔 Gain Weight";
    const readPath = "Atlas/+ Maps/📖 Read";
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
      [
        "ExercisesPerWeek",
        {
          path: exercisePath,
          goalKey: "daysExercisedPerWeekTarget",
        },
      ],
      // TODO: pending interface
      [
        "WeightGainTarget",
        {
          path: gainWeightPath,
          goalKey: "target",
        },
      ],
      // TODO: pending interface
      [
        "ReadTarget",
        {
          path: readPath,
          goalKey: "target",
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
    let pastHours = this.ramp(sleepTime.diff(sleepTimeGoal, "hours", true));
    return pastHours;
  }

  getDietTimeGoals() {
    let breakfastTimeGoal = moment(this.getGoal("BreakfastTime"), "HH:mm");
    let lunchTimeGoal = moment(this.getGoal("LunchTime"), "HH:mm");
    let dinnerTimeGoal = moment(this.getGoal("DinnerTime"), "HH:mm");
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

  getHoursPastDietTimeGoal(p, config) {
    let breakfastTime = p.breakfast ? moment(p.breakfast, "HH:mm") : undefined;
    let lunchTime = p.lunch ? moment(p.lunch, "HH:mm") : undefined;
    let dinnerTime = p.dinner ? moment(p.dinner, "HH:mm") : undefined;

    let {
      breakfastTimeGoal,
      lunchTimeGoal,
      dinnerTimeGoal,
      pastBreakfast,
      pastLunch,
      pastDinner,
    } = config ? config : this.getDietTimeGoals();

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
