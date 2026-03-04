import path from "path";
import fs from "fs/promises";

const FILE_TYPE = { FILE: "file", DIRECTORY: "directory" };
const READ_FILE_CONFIG = { encoding: "base64" };
const SNAPSHOT_FILE_NAME = "snapshot.json";
const WORKSPACE_PATH = "workspace";
const SPACE_COUNT = 2;

const projectRoot = process.cwd();

const snapshot = async () => {
  const workspacePath = path.join(projectRoot, WORKSPACE_PATH);

  try {
    await fs.access(workspacePath);
  } catch (err) {
    console.error("Папка workspace не найдена по пути:", workspacePath);
    return;
  }

  const snapshotObject = {
    rootPath: workspacePath,
    entries: [],
  };

  const scanDirectory = async (currentPath, relativePath = "") => {
    const items = await fs.readdir(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relative = path.join(relativePath, item);
      const stats = await fs.stat(fullPath);

      const chunk = stats.isDirectory()
        ? {
            path: relative,
            type: FILE_TYPE.DIRECTORY,
          }
        : {
            path: relative,
            type: FILE_TYPE.FILE,
            size: stats.size,
            content: await fs.readFile(fullPath, READ_FILE_CONFIG),
          };

      if (chunk.type === FILE_TYPE.DIRECTORY) {
        await scanDirectory(fullPath, relative);
      }

      snapshotObject.entries.push(chunk);
    }
  };

  await scanDirectory(workspacePath);

  await fs.writeFile(
    SNAPSHOT_FILE_NAME,
    JSON.stringify(snapshotObject, null, SPACE_COUNT),
  );
};

await snapshot();
