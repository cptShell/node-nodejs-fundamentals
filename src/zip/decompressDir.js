import fs from "fs";
import path from "path";
import zlib from "zlib";
import { PassThrough } from "stream";
import { pipeline } from "stream/promises";

const WORKSPACE_PATH = "workspace";
const COMPRESSED_DIR_NAME = "compressed";
const DECOMPRESSED_DIR_NAME = "decompressed";
const ARCHIVE_NAME = "archive.br";
const FS_OPERATION_FAILED = "FS operation failed";
const ENCODING_UTF8 = "utf-8";

const projectRoot = process.cwd();

const decompressDir = async () => {
  const workspacePath = path.join(projectRoot, WORKSPACE_PATH);
  const compressedPath = path.join(workspacePath, COMPRESSED_DIR_NAME);
  const decompressedPath = path.join(workspacePath, DECOMPRESSED_DIR_NAME);
  const archivePath = path.join(compressedPath, ARCHIVE_NAME);

  try {
    await fs.promises.access(archivePath);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  await fs.promises.mkdir(decompressedPath, { recursive: true });

  const readStream = fs.createReadStream(archivePath);
  const decompress = zlib.createBrotliDecompress();
  const chunks = [];
  const collector = new PassThrough();
  collector.on("data", (chunk) => chunks.push(chunk));

  await pipeline(readStream, decompress, collector);
  const buffer = Buffer.concat(chunks);

  let offset = 0;
  const readUInt32BE = () => {
    const value = buffer.readUInt32BE(offset);
    offset += 4;
    return value;
  };
  const readBytes = (n) => {
    const slice = buffer.subarray(offset, offset + n);
    offset += n;
    return slice;
  };

  const headerLength = readUInt32BE();
  const headerJson = readBytes(headerLength).toString(ENCODING_UTF8);
  const fileList = JSON.parse(headerJson);

  for (const entry of fileList) {
    const filePath = path.join(decompressedPath, entry.path);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    const content = readBytes(entry.size);
    await fs.promises.writeFile(filePath, content);
  }
};

await decompressDir();
