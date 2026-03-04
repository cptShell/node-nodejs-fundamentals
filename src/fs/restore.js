import path from "path";
import fs from "fs/promises";

const SNAPSHOT_FILE_NAME = "snapshot.json";
const RESTORED_DIR_NAME = "workspace_restored";
const ENCODING_TYPE = { BASE64: "base64", UTF8: "utf-8" };
const FILE_TYPE = { FILE: "file", DIRECTORY: "directory" };
const READ_FILE_CONFIG = { encoding: ENCODING_TYPE.UTF8 };
const CREATE_DIR_CONFIG = { recursive: true };

const projectRoot = process.cwd();

const restore = async () => {
  const snapshotPath = path.join(projectRoot, SNAPSHOT_FILE_NAME);

  try {
    await fs.access(snapshotPath);
  } catch {
    console.error("Snapshot не найден по пути:", snapshotPath);
    return;
  }

  const snapshotData = await fs.readFile(snapshotPath, READ_FILE_CONFIG);
  const snapshot = JSON.parse(snapshotData);
  const restoredRoot = path.join(projectRoot, RESTORED_DIR_NAME);

  await fs.mkdir(restoredRoot, CREATE_DIR_CONFIG);

  for (const entry of snapshot.entries ?? []) {
    const targetPath = path.join(restoredRoot, entry.path);

    if (entry.type === FILE_TYPE.DIRECTORY) {
      await fs.mkdir(targetPath, CREATE_DIR_CONFIG);
    } else if (entry.type === FILE_TYPE.FILE) {
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, CREATE_DIR_CONFIG);

      const buffer = Buffer.from(entry.content, ENCODING_TYPE.BASE64);
      await fs.writeFile(targetPath, buffer);
    }
  }
};

await restore();
