module.exports = {
  entry: start,
  settings: {
    name: "Create Milestone",
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

  // Step 1: Create milestone form
  const result = await modalForm.openForm(getForm());

  let milestoneName = result.get("name");
  let milestoneDesc = result.get("description");
  let targetDate = result.get("target") ?? "";
  let accomplished = result.get("accomplished") ?? false;

  if (!milestoneName || !milestoneDesc) {
    console.log("Cancelled create milestone");
    return;
  }

  // Step 2: Add milestone to current effort page
  const content = await app.vault.read(currentFile);

  const milestoneHeader = "Milestone";
  const re = new RegExp(`(#+)[\\s]*?${milestoneHeader}\\s*?\n*`, "gm");
  let match = re.exec(content);
  let hash = undefined;

  if (match) {
    let milestone = `- [Milestone:: ${milestoneName}], [Desc:: ${milestoneDesc}], [Target:: ${targetDate}], [Accomplished:: ${accomplished ? targetDate : ""}]`;
    // get first 6 characters of hash
    hash = await Common.sha256(milestone, 6);
    milestone = `${milestone}\n^${hash}\n`;
    // insert to top of the milestone section
    await this.app.vault.process(currentFile, (data) => {
      data = data.replace(
        re,
        `${match[1]} ${milestoneHeader}\n\n${milestone}\n`
      );
      return data;
    });
  } else {
    throw new Error("Cannot find milestone section in current file");
  }
}

/**
 * Get the create milestone form
 *
 * @returns
 */
function getForm() {
  let form = {
    title: "Create Milestone",
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
        description: "What makes up this milestone?",
        isRequired: true,
        input: {
          type: "text",
        },
      },
      {
        name: "target",
        label: "Target Date",
        description: "Tentative date to reach this milestone",
        isRequired: false,
        input: {
          type: "date",
        },
      },
      {
        name: "accomplished",
        label: "Accomplished?",
        type: "toggle",
        description: "",
        input: { type: "toggle" },
      },
    ],
  };
  return form;
}
