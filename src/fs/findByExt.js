import path from "path";
import fs from "fs/promises";

const EXTENSION_ARG = "--ext";
const WORKSPACE_PATH = "workspace";
const DEFAULT_EXT = ".txt";
const FS_OPERATION_FAILED = "FS operation failed";
const READ_FILE_CONFIG = { withFileTypes: true };

const rootPath = process.cwd();


const getExtension = (args) => {
  const extIndex = args.indexOf(EXTENSION_ARG);

  if (extIndex !== -1 && args[extIndex + 1]) {
    let rawExt = args[extIndex + 1];

    return !rawExt.startsWith(".") ? `.${rawExt}` : rawExt;
  }

  return null;
};

const findByExt = async () => {
  const ext = getExtension(process.argv) ?? DEFAULT_EXT;

  const workspacePath = path.join(rootPath, WORKSPACE_PATH);

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
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

  filesByExt.sort();

  filesByExt.forEach((file) => console.log(file));
}

await findByExt();
