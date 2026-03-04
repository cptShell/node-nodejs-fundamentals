import path from "path";
import fs from "fs/promises";

const EXTENSION_ARG = "--ext";
const WORKSPACE_PATH = "workspace";
const READ_FILE_CONFIG = { withFileTypes: true };

const rootPath = process.cwd();


const getExtension = (args) => {
  const extIndex = args.indexOf(EXTENSION_ARG);

  if (extIndex !== -1 && args[extIndex + 1]) {
    let rawExt = args[extIndex + 1];
    if (!rawExt.startsWith(".")) {
      rawExt = `.${rawExt}`;
    }
    return rawExt;
  }
  return null;
};

const findByExt = async () => {
  const ext = getExtension(process.argv);

  const workspacePath = path.join(rootPath, WORKSPACE_PATH);

  try {
    await fs.access(workspacePath);
  } catch {
    console.error("Папка workspace не найдена по пути:", workspacePath);
    return;
  }

  const collectFilesByExt = async (
    currentPath,
    relativePath,
    results,
  ) => {
    const items = await fs.readdir(currentPath, READ_FILE_CONFIG);

    for (const item of items) {
      const itemName = item.name;
      const fullPath = path.join(currentPath, itemName);
      const relative = path.join(relativePath, itemName);

      if (item.isDirectory()) {
        await collectFilesByExt(fullPath, relative, results);
      } else if (item.isFile()) {
        if (path.extname(itemName) === ext) {
          results.push(relative);
        }
      }
    }
  };

  const filesByExt = [];

  await collectFilesByExt(workspacePath, "", filesByExt);

  console.log(filesByExt);
}

await findByExt();
