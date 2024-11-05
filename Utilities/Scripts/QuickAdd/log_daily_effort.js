module.exports = {
  entry: start,
  settings: {
    name: "Log Daily Effort Accomplishment",
    author: "Andrew Chen",
    options: {},
  },
};

let QuickAdd;
let Settings;

function wrapDV(k, v) {
  return `[${k}::${v}]`;
}

async function start(params, settings) {
  const { Common } = await cJS();

  QuickAdd = params;
  Settings = settings;

  const currentFile = app.workspace.getActiveFile();
  const dv = app.plugins.plugins["dataview"].api;
  const page = dv.page(`${currentFile.path}`);
  const currentEffortsLogged = getEffortsLogged(page, Common);
  const modalForm = app.plugins.plugins.modalforms.api;
  const result = await modalForm.openForm(
    getLogEffortForm(currentEffortsLogged)
  );
  let ename = result.get("ename");
  let desc = result.get("desc");
  if (!ename && !desc) {
    return;
  }

  let snippet = "- ";
  snippet += wrapDV("EName", ename);
  snippet += ", " + wrapDV("Desc", desc);
  

  snippet += "\n";

  QuickAdd.variables = {
    snippet: snippet,
  };
}

function getEffortsLogged(page, Common) {
  if (!page.EName || !page.Desc) {
    return [];
  }
  let names = Common.toArray(page.EName);
  let descs = Common.toArray(page.Desc);
  return names.map((_, i) => {
    return {
      name: names[i],
      desc: descs[i],
    };
  });
}

// TODO: update this
/**
 * Get form for logging effort
 * @returns form object
 */
function getLogEffortForm(effortsLogged) {
  let effortsLoggedHtml = effortsLogged
    .map((e) => `<li>${e.name}: ${e.desc}</li>`)
    .join("");
  let form = {
    title: "Log Effort",
    fields: [
      {
        name: "ename",
        label: "Effort",
        description: "",
        isRequired: true,
        input: {
          type: "dataview",
          query:
            "dv.pages('#effort').where(p => !p.file.path.startsWith('Utilities')).file.name",
        },
      },
      {
        name: "desc",
        label: "Description",
        description: "What did I accomplished for this effort today?",
        isRequired: true,
        input: {
          type: "text",
        },
      },
      {
        name: "loggedEfforts",
        label: "Efforts logged today",
        description: "",
        input: {
          type: "document_block",
          allowUnknownValues: false,
          body: `return "<ul>${effortsLoggedHtml}</ul>"`,
        },
        isRequired: false,
      },
    ],
  };
  return form;
}
