import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { pipeline } from "stream/promises";

const CHECKSUMS_FILE_NAME = "checksums.json";
const FS_OPERATION_FAILED = "FS operation failed";
const HASH_ALGORITHM = "sha256";
const DIGEST_HEX = "hex";
const ENCODING_UTF8 = "utf-8";
const SEPARATOR = " — ";
const RESULT = { OK: "OK", FAIL: "FAIL" };

const verify = async () => {
  const rootPath = process.cwd();
  const checksumsPath = path.join(rootPath, CHECKSUMS_FILE_NAME);

  try {
    await fs.promises.access(checksumsPath);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  const checksumsData = await fs.promises.readFile(checksumsPath, ENCODING_UTF8);
  const checksumsObject = JSON.parse(checksumsData);

  for (const [filename, expectedHex] of Object.entries(checksumsObject)) {
    const filePath = path.join(rootPath, filename);
    let actualHex;

    try {
      const hash = createHash(HASH_ALGORITHM);
      await pipeline(fs.createReadStream(filePath), hash);
      actualHex = hash.digest(DIGEST_HEX);
    } catch {
      actualHex = "";
    }

    const result = actualHex === expectedHex ? RESULT.OK : RESULT.FAIL;
    console.log(`${filename}${SEPARATOR}${result}`);
  }
};

await verify();
