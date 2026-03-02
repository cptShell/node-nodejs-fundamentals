import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const FILE_TYPE = {
  FILE: "file",
  DIRECTORY: "directory",
};

const projectRoot = process.cwd();

const snapshot = async () => {
  const workspacePath = path.join(projectRoot, "workspace");

  try {
    await fs.access(workspacePath);
  } catch (err) {
    console.error("Папка workspace не найдена по пути:", workspacePath);
    return;
  }

  const snapshotObject = {
    rootPath: workspacePath,
    entries: []
  };

  const scanDirectory = async (currentPath, relativePath = '') => {
    const items = await fs.readdir(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relative = path.join(relativePath, item);
      const stats = await fs.stat(fullPath);

      const chunk = stats.isDirectory() ? {
        path: relative,
        type: FILE_TYPE.DIRECTORY
      } : {
        path: relative,
        type: FILE_TYPE.FILE,
        size: stats.size,
        content: await fs.readFile(fullPath, 'base64')
      };

      if (chunk.type === FILE_TYPE.DIRECTORY) {
        await scanDirectory(fullPath, relative);
      }

      snapshotObject.entries.push(chunk);
    }
  }
  console.log(workspacePath);
  await scanDirectory(workspacePath);

  await fs.writeFile('snapshot.json', JSON.stringify(snapshotObject, null, 2));
};

await snapshot();
