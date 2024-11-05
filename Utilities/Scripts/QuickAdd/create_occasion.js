module.exports = {
  entry: start,
  settings: {
    name: "Occasion",
    author: "Andrew Chen",
    options: {},
  },
};

let QuickAdd;
async function start(params, settings) {
  QuickAdd = params;

  const modalForm = app.plugins.plugins.modalforms.api;

  // Step 1: Ask user for some details about the occasion
  const result = await modalForm.openForm("occasion");
  let title = result.get("title");
  let startDate = result.get("startDate");
  let endDate = result.get("endDate");
  if (!title) {
    console.log("user didn't complete form");
    return;
  }

  // Step 2: Compute the days
  startDate = moment(startDate);
  endDate = moment(endDate);

  if (!startDate.isSameOrBefore(endDate)) {
    throw new Error(
      "Occasion start date is after end date. Please specify correct start date and end date"
    );
  }

  let days = [];
  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    // daily note format
    days.push(currentDate.format("yyyy-MM-DD - ddd MMM D"));
    currentDate.add(1, "days");
  }

  QuickAdd.variables = {
    fileName: replaceIllegalFileNameCharactersInString(title),
    days: days,
  };
}

function replaceIllegalFileNameCharactersInString(string) {
  return string.replace(/[\\,#%&\{\}\/*<>$\":@.]*/g, "");
}
