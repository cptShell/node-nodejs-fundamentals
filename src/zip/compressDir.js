import fs from "fs";
import path from "path";
import zlib from "zlib";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const WORKSPACE_PATH = "workspace";
const TO_COMPRESS_DIR_NAME = "toCompress";
const COMPRESSED_DIR_NAME = "compressed";
const ARCHIVE_NAME = "archive.br";
const FS_OPERATION_FAILED = "FS operation failed";
const ENCODING_TYPE = { UTF8: "utf-8" };
const READ_FILE_CONFIG = { withFileTypes: true };

const projectRoot = process.cwd();

async function collectFiles(dirPath, relativeDir = "") {
  const entries = await fs.promises.readdir(dirPath, READ_FILE_CONFIG);
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const stat = await fs.promises.stat(fullPath);
      files.push({ relativePath, fullPath, size: stat.size });
    }
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

const compressDir = async () => {
  const workspacePath = path.join(projectRoot, WORKSPACE_PATH);
  const toCompressPath = path.join(workspacePath, TO_COMPRESS_DIR_NAME);
  const compressedPath = path.join(workspacePath, COMPRESSED_DIR_NAME);
  const archivePath = path.join(compressedPath, ARCHIVE_NAME);

  try {
    await fs.promises.access(toCompressPath);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  await fs.promises.mkdir(compressedPath, { recursive: true });

  const fileList = await collectFiles(toCompressPath);
  const headerData = fileList.map((f) => ({ path: f.relativePath, size: f.size }));
  const header = JSON.stringify(headerData);
  const headerBuffer = Buffer.from(header, ENCODING_TYPE.UTF8);
  const headerLength = Buffer.allocUnsafe(4);
  headerLength.writeUInt32BE(headerBuffer.length, 0);

  async function* source() {
    yield headerLength;
    yield headerBuffer;
    for (const file of fileList) {
      const stream = fs.createReadStream(file.fullPath);
      for await (const chunk of stream) yield chunk;
    }
  }

  const readable = Readable.from(source());
  const compress = zlib.createBrotliCompress();
  const writeStream = fs.createWriteStream(archivePath);

  await pipeline(readable, compress, writeStream);
};

await compressDir();
