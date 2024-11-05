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

  // Step 1: Check if kanban board is associated with this effort
  let kanbanLaneHeaders = undefined;
  let kanbanFile = undefined;
  // test if it's an internal link object
  if (
    page.board &&
    page.board.path &&
    isKanbanPage(dv.page(`${page.board.path}`))
  ) {
    // Get kanban lane headers as options to add the milestone to
    kanbanFile = this.app.vault.getFileByPath(page.board.path);
    let content = await app.vault.read(kanbanFile);
    kanbanLaneHeaders = getKanbanLanes(content);
  }

  // Step 2: Create milestone form
  const result = await modalForm.openForm(getForm(kanbanLaneHeaders));

  let milestoneName = result.get("name");
  let milestoneDesc = result.get("description");
  let targetDate = result.get("target") ?? "";

  if (!milestoneName || !milestoneDesc) {
    console.log("Cancelled create milestone");
    return;
  }

  // Step 3: Add milestone to current effort page
  const content = await app.vault.read(currentFile);

  const milestoneHeader = "Milestone";
  const re = new RegExp(`(#+)[\\s]*?${milestoneHeader}\\s*?\n*`, "gm");
  let match = re.exec(content);
  let hash = undefined;

  if (match) {
    let milestone = `- [Milestone:: ${milestoneName}], [Desc:: ${milestoneDesc}], [InitialTarget:: ${targetDate}], [Target:: ${targetDate}], [Accomplished:: ]`;
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

  if (kanbanLaneHeaders) {
    let lane = result.get("lane");
    if (lane) {
      const re = new RegExp(`(#+)[\\s]*?${lane}\\s*?\n*`, "gm");
      const milestoneKanbanDivider = `- [ ] ==***[[${currentFile.basename}#^${hash}|Milestone - ${milestoneName}]]***==`;
      // insert to top of the milestone section
      await this.app.vault.process(kanbanFile, (data) => {
        data = data.replace(
          re,
          `${match[1]} ${lane}\n\n${milestoneKanbanDivider}\n`
        );
        return data;
      });
    }
  }
}

function isKanbanPage(kanbanPage) {
  return !!kanbanPage["kanban-plugin"];
}

/**
 * @param {*} content - file content of the obsidian kanban page
 * @returns list of heading
 */
function getKanbanLanes(content) {
  const headers = [];
  let bodyLines = content.split("\n");
  bodyLines.forEach((line, index) => {
    const match = line.match(/^#+[\s]?(.*)$/);
    if (!match) return;
    headers.push(match[1]);
  });
  return headers;
}

/**
 * Get the create milestone form
 *
 * @param {*} kanbanLanesHeaders
 * @returns
 */
function getForm(kanbanLanesHeaders) {
  let kanbanLaneForm = undefined;
  if (kanbanLanesHeaders) {
    let kanbanLanesOptions = kanbanLanesHeaders.map((h) => {
      return {
        value: h,
        label: h,
      };
    });

    kanbanLaneForm = {
      name: "lane",
      label: "Kanban Lane",
      description: "Kanban lane to add this milestone to",
      input: {
        type: "select",
        allowUnknownValues: false,
        options: kanbanLanesOptions,
        source: "fixed",
      },
      isRequired: true,
    };
  }

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
        description: "What makes up this milestone? Keep it high level",
        isRequired: true,
        input: {
          type: "text",
        },
      },
      {
        name: "target",
        label: "Target Date",
        description: "Tentative date you like to reach this milestone",
        isRequired: false,
        input: {
          type: "date",
        },
      },
    ],
  };

  if (kanbanLaneForm) {
    form.fields.push(kanbanLaneForm);
  }

  return form;
}
