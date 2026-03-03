import path from "path";
import fs from "fs/promises";

const SNAPSHOT_FILE_NAME = "snapshot.json";
const RESTORED_DIR_NAME = "workspace_restored";
const ENCODING_TYPE = { BASE64: "base64", UTF8: "utf-8" };
const READ_FILE_CONFIG = { encoding: ENCODING_TYPE.UTF8 };

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

  await fs.mkdir(restoredRoot, { recursive: true });

  for (const entry of snapshot.entries ?? []) {
    const targetPath = path.join(restoredRoot, entry.path);

    if (entry.type === "directory") {
      await fs.mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, { recursive: true });

      const buffer = Buffer.from(entry.content, ENCODING_TYPE.BASE64);
      await fs.writeFile(targetPath, buffer);
    }
  }
};

await restore();
