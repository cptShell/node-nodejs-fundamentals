import fs from "fs/promises";
import path from "path";

const FILES_ARG = "--files";
const FILES_SEPARATOR = ",";
const WORKSPACE_PATH = "workspace";
const PARTS_DIR_NAME = "parts";
const MERGED_FILE_NAME = "merged.txt";

const EXTENSION_TXT = ".txt";
const ENCODING_TYPE = { UTF8: "utf-8" };
const READ_FILE_CONFIG = { encoding: ENCODING_TYPE.UTF8 };
const FS_OPERATION_FAILED = "FS operation failed";

const projectRoot = process.cwd();

const workspacePath = path.join(projectRoot, WORKSPACE_PATH);
const partsPath = path.join(workspacePath, PARTS_DIR_NAME);
const mergedPath = path.join(workspacePath, MERGED_FILE_NAME);

const getFiles = (args) => {
  const filesIndex = args.indexOf(FILES_ARG);

  return filesIndex !== -1 && args[filesIndex + 1]
    ? args[filesIndex + 1].split(FILES_SEPARATOR)
    : [];
};

const partsMapper = (file) => fs.readFile(path.join(partsPath, file), READ_FILE_CONFIG);

const sortFiles = (files) => files.sort((a, b) => a.localeCompare(b));

const merge = async () => {
  try {
    await fs.access(partsPath);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  const args = process.argv.slice(2);
  const filesFromArgs = getFiles(args);

  let filesToMerge;

  if (filesFromArgs.length > 0) {
    filesToMerge = filesFromArgs;
  } else {
    const allFiles = await fs.readdir(partsPath);
    const txtFiles = allFiles.filter((name) =>
      name.toLowerCase().endsWith(EXTENSION_TXT),
    );
    if (txtFiles.length === 0) {
      throw new Error(FS_OPERATION_FAILED);
    }
    filesToMerge = sortFiles(txtFiles);
  }

  let mergedContent;

  try {
    mergedContent = await Promise.all(filesToMerge.map(partsMapper));
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  const output = mergedContent.join("\n");
  await fs.writeFile(mergedPath, output);
};

await merge();
