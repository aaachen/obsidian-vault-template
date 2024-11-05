module.exports = {
  entry: start,
  settings: {
    name: "Log Daily Metrics",
    author: "Andrew Chen",
    options: {},
  },
};

let QuickAdd;
let Settings;

async function start(params, settings) {
  QuickAdd = params;
  Settings = settings;

  const modalForm = app.plugins.plugins.modalforms.api;
  const dv = app.plugins.plugins["dataview"].api;
  const { update } = app.plugins.plugins["metaedit"].api;
  const path = app.workspace.getActiveFile().path;
  const page = dv.page(`${path}`);
  const defaultValues = {
    proud: page.proud
  };
  const result = await modalForm.openForm("log_daily_metrics", { values: defaultValues });
  let proud = result.get("proud");
  
  // user hit cancel
  if (!proud) {
     return;
  }

  await update("proud", proud, path);
}
