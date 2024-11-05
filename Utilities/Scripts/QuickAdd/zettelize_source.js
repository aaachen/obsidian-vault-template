module.exports = async (params) => {
    console.log("Starting...")
    console.log(params);
    const currentFile = params.app.workspace.getActiveFile();
    if (!currentFile) {
        new Notice("No active file.");
        return;
    }
    console.log("Found active file: ", currentFile.basename);

    const currentFileContent = await params.app.vault.cachedRead(currentFile);
    const currentFileCache = params.app.metadataCache.getFileCache(currentFile);
    const headingsInFile = currentFileCache.headings;
    if (!headingsInFile) {
        new Notice(`No headers in file ${currentFile.name}`);
        return;
    }
    console.log("Found headings in active file: ", headingsInFile);

    const folder = "Atlas/Notes/Claims";
    if (!params.app.vault.adapter.exists(folder)) {
        new Notice(`Could not find folder ${folder}`);
        return;
    }

    console.log("Folder does exist: ", folder);

    let addedFiles = [];
    let updatedFileContent = []
    const indicesToRemove = [];

    for (let i = 0; i < headingsInFile.length; i++) {
        const heading = headingsInFile[i];
        console.log(`Checking ${heading.heading}. It is level ${heading.level}`);
        if (heading.level === 3) {
            // TODO: get id, reference only the id, copy over annotation
            
            const splitHeading = heading.heading.split(" ");
            const location = splitHeading[0].trim();
            const text = splitHeading.length > 1 ? [...splitHeading.slice(1)].join(' ').trim().replace(/[\\,#%&\{\}\/*<>$\'\":@]*/g, '') : "";
            const headingStart = heading.position.start.line
            const headingEnd = headingsInFile[i+1] ? headingsInFile[i+1].position.end.line - 1 : Infinity
            
            const path = `${folder}/${text}.md`;
            let content = `![[${currentFile.basename}#${location}${text ? " " + text : ""}]]`;
            const tasksToMove = [];
            currentFileContent.split("\n").forEach((line, index) => {
                if (index >= headingStart && index <= headingEnd) {
                    if (line.startsWith(`- [n]`) || line.startsWith(`- [?]`)) {
                        indicesToRemove.push(index)
                        tasksToMove.push(line.trim());
                    }
                }
            });
            content = content + "\n" + tasksToMove.join("\n") + "\n";
            

            console.log(`Path: ${path}.\nContent: ${content}`);
            
            if (text && !(await params.app.vault.adapter.exists(path))) {
                const file = await params.app.vault.create(path, content);
                addedFiles = [...addedFiles, file];
            }
            else if (text)
                new Notice(`File ${path} already exists.`, 5000);
        }
    }

    if (addedFiles.length > 0) {
        const formattedAddedFiles = addedFiles.map(f => `[[${f.basename}]]`);
        {
            const addedFilesBlock = `- [i] Outline \n     - ${formattedAddedFiles.join("\n     - ")}`;
            currentFileContent.split("\n").forEach((line, index) => {
                if (indicesToRemove.includes(index)) {
                    return;
                }
                if (line === "## Highlights") {
                    updatedFileContent.splice(index - 1, 0, addedFilesBlock)
                }
                    updatedFileContent.push(line);
            });
        }

        await params.app.vault.modify(currentFile, updatedFileContent.join("\n"));
    }

    console.log("Finished!");
}
