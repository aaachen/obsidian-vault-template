module.exports = {
  entry: start,
  settings: {
    name: "Update Milestone",
    author: "Andrew Chen",
    options: {},
  },
};

async function start(params, settings) {
  const { Common } = await cJS();

  const dv = app.plugins.plugins["dataview"].api;
  const modalForm = app.plugins.plugins.modalforms.api;
  const currentFile = app.workspace.getActiveFile();
  const page = dv.page(`${currentFile.path}`);

  if (
    !(
      Array.isArray(page.tags) &&
      page.tags.some((tag) => tag.includes("effort"))
    )
  ) {
    throw new Error(
      "This script can only be run in an effort page (i.e. tagged with #effort)"
    );
  }

  // Step 1: Get milestones in this file
  let milestones = Common.toArray(page.Milestone);
  if (!milestones) {
    throw new Error("No milestones to update in this file");
  }

  // Step 2: Ask user which milestone to edit
  let result = await modalForm.openForm(
    getWhichMilestoneUpdateForm(milestones)
  );
  let oldMilestoneName = result.get("milestone");

  if (!oldMilestoneName) {
    console.log("User did not select a milestone");
    return;
  }

  // Step 3: Get current data associated with the selected milestone
  let i = milestones.findIndex((m) => m == oldMilestoneName);

  let milestoneDesc = Common.toArray(page.Desc);
  let oldMilestoneDesc = milestoneDesc[i];
  let targetDate = Common.toArray(page.Target) ?? [undefined];
  let initialTarget = Common.toArray(page.InitialTarget) ?? [undefined];
  let accomplished = Common.toArray(page.Accomplished) ?? [undefined];

  let currentMilestoneValues = {
    name: oldMilestoneName,
    description: oldMilestoneDesc,
    initialTarget: initialTarget[i]
      ? initialTarget[i].toFormat("yyyy-MM-dd")
      : "",
    target: targetDate[i] ? targetDate[i].toFormat("yyyy-MM-dd") : "",
    accomplished: accomplished[i] ? accomplished[i].toFormat("yyyy-MM-dd") : "",
  };

  // Step 4: Ask user to update specific milestone details
  result = await modalForm.openForm(getUpdateMilestoneForm(), {
    values: currentMilestoneValues,
  });

  let milestoneName = result.get("name");
  milestoneDesc = result.get("description");
  initialTarget = result.get("initialTarget") ?? "";
  targetDate = result.get("target") ?? "";
  accomplished = result.get("accomplished") ?? "";

  if (!milestoneName || !milestoneDesc) {
    console.log("Cancelled update milestone");
    return;
  }

  // Step 5: Update current file
  let hash = await updateMilestone(
    oldMilestoneName,
    oldMilestoneDesc,
    [milestoneName, milestoneDesc, initialTarget, targetDate, accomplished],
    currentFile
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Update milestone in current file
 *
 * @param {*} oldName - old milestone name, used to identify milestone to update
 * @param {*} oldDesc - old milestone desc, used to identify milestone to update
 * @param {*} result - new milestone values from form
 * @param {*} currentFile - currentFile to update
 * @returns hash of the updated milestone (as side effect)
 */
async function updateMilestone(oldName, oldDesc, result, currentFile) {
  const [name, desc, initialTarget, target, accomplished] = [...result];
  const content = await app.vault.read(currentFile);

  const re = new RegExp(
    `-\\s+\\[Milestone::\\s*${escapeRegex(
      oldName
    )}\\s*\\],\\s*\\[Desc::\\s*${escapeRegex(oldDesc)}\\s*\\].+?\\s*\\^(.+?)\n`,
    "gm"
  );
  let match = re.exec(content);
  let hash = undefined;

  // Update milestone
  if (match) {
    hash = match[1];
    let newMilestone = `- [Milestone:: ${name}], [Desc:: ${desc}], [InitialTarget:: ${initialTarget}], [Target:: ${target}], [Accomplished:: ${accomplished}]\n^${hash}\n`;
    await this.app.vault.process(currentFile, (data) => {
      data = data.replace(re, newMilestone);
      return data;
    });
  } else {
    throw new Error(
      "Cannot find corresponding milestone to update in current file"
    );
  }
  return hash;
}

/**
 * Get form asking for which milestones to update
 *
 * @param {*} values available milestones
 * @returns form object
 */
function getWhichMilestoneUpdateForm(availableMilestones) {
  let milestoneOptions = availableMilestones.map((m) => {
    return {
      value: m,
      label: m,
    };
  });
  let form = {
    title: "Update Milestone",
    fields: [
      {
        name: "milestone",
        label: "Which milestone to update?",
        description: "Choose a milestone to update",
        input: {
          type: "select",
          allowUnknownValues: false,
          options: milestoneOptions,
          source: "fixed",
        },
        isRequired: true,
      },
    ],
  };
  return form;
}

/**
 * Get form for updating a specific milestone
 * @returns form object
 */
function getUpdateMilestoneForm() {
  let form = {
    title: "Update Milestone",
    fields: [
      {
        name: "name",
        label: "Milestone",
        description: "Name of milestone",
        isRequired: true,
        input: {
          type: "text",
        },
      },
      {
        name: "description",
        label: "Description",
        description: "What makes up this milestone? Keep it high level",
        isRequired: true,
        input: {
          type: "text",
        },
      },
      {
        name: "initialTarget",
        label: "Initial Target Date",
        description: "Initial date you set to reach this milestone",
        isRequired: false,
        input: {
          type: "date",
        },
      },
      {
        name: "target",
        label: "Target Date",
        description: "Current target date to reach this milestone",
        isRequired: false,
        input: {
          type: "date",
        },
      },
      {
        name: "accomplished",
        label: "Accomplished Date",
        description: "Date when you accomplished this milestone",
        isRequired: false,
        input: {
          type: "date",
        },
      },
    ],
  };
  return form;
}
