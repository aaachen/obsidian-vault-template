const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

// Do NOT edit this.
const PREFIX = "File Name";

module.exports = {
  entry: start,
  settings: {
    name: "Suggest Files",
    author: "Andrew",
    options: {
      [PREFIX]: {
        type: "text",
        defaultValue: "",
        placeholder: "Suggest files containing name, :: to delimit multiple names",
      },
    },
  },
};

let QuickAdd;
let Settings;

async function start(params, settings) {
  QuickAdd = params;
  Settings = settings;
  let prefixSetting = Settings[PREFIX];
  let prefixes = prefixSetting.split("::");

  const files = await QuickAdd.app.vault.getFiles();
  const {
    quickAddApi: { suggester },
  } = QuickAdd;
  const filteredFiles = files.filter((file) => prefixes.some(prefix => file.path.includes(prefix))).map(f => f.path);

  const selection = await suggester(filteredFiles, filteredFiles);
  if (!selection) {
    notice("No choice selected.");
    throw new Error("No choice selected.");
  }
  console.log(selection);

  QuickAdd.variables = {
    selection: selection,
  };
}
