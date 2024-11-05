const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const PREFIX = "Folder Name";
const LEVEL_OF_SUBPATH =
  "Level of subpaths to include, -1 to include all subpaths";

module.exports = {
  entry: start,
  settings: {
    name: "Suggest Folders",
    author: "Andrew",
    options: {
      [PREFIX]: {
        type: "text",
        defaultValue: "",
        placeholder:
          "Suggest folders containing name, :: to delimit multiple names",
      },
      [LEVEL_OF_SUBPATH]: {
        type: "text",
        defaultValue: "-1",
        placeholder: "-1",
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
  let levelOfSubpaths = Number(Settings[LEVEL_OF_SUBPATH]);
  let prefixes = prefixSetting.split("::");

  const folders = app.vault.getAllFolders();
  const {
    quickAddApi: { suggester },
  } = QuickAdd;
  const filteredFolders = folders
    .filter((folder) =>
      prefixes.some((prefix) => {
        if (folder.path.startsWith(prefix)) {
          // Create a regex to match the prefix followed by a specified number of segments
          const segments = "/[^/]+".repeat(levelOfSubpaths);
          const regex = new RegExp(`^${prefix}${segments}$`);
          return regex.test(folder.path);
        }
        return false;
      })
    )
    .map((f) => f.path);

  const selection = await suggester(filteredFolders, filteredFolders);
  if (!selection) {
    notice("No choice selected.");
    throw new Error("No choice selected.");
  }
  console.log(selection);

  QuickAdd.variables = {
    selection: selection,
  };
}
