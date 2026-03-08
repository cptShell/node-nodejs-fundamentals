import path from "path";
import os from "os";
import fs from "fs/promises";
import { Worker } from "worker_threads";

const DATA_FILE = "data.json";
const WT_DIR = "src/wt";
const WORKER_FILE = "worker.js";
const ENCODING_TYPE = { UTF8: "utf-8" };
const READ_FILE_CONFIG = { encoding: ENCODING_TYPE.UTF8 };
const WORKER_EVENT = {
  MESSAGE: "message",
  ERROR: "error",
  EXIT: "exit",
};
const EXIT_CODE_SUCCESS = 0;
const FS_OPERATION_FAILED = "FS operation failed";
const WORKER_EXIT_CODE_ERROR = "Worker stopped with code";

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, DATA_FILE);
const workerPath = path.join(projectRoot, WT_DIR, WORKER_FILE);

const splitIntoChunks = (array, numberOfChunks) => {
  const size = Math.ceil(array.length / numberOfChunks);

  return new Array(numberOfChunks)
    .fill(0)
    .map((_, chunkIndex) => array.slice(chunkIndex * size, (chunkIndex + 1) * size))
    .filter((chunk) => chunk.length > 0);
};

const mergeSorted = (sortedChunks) => {
  const indices = sortedChunks.map(() => 0);
  const result = [];

  while (true) {
    const minIndex = sortedChunks.reduce((headChunkIndex, chunk, chunkIndex) => {
      const currentReadIndex = indices[chunkIndex];

      if (currentReadIndex >= chunk.length) return headChunkIndex;

      const value = chunk[currentReadIndex];

      if (headChunkIndex === -1) return chunkIndex;

      const headChunk = sortedChunks[headChunkIndex][indices[headChunkIndex]];

      if (value < headChunk) return chunkIndex;

      return headChunkIndex;
    }, -1);

    if (minIndex === -1) break;

    result.push(sortedChunks[minIndex][indices[minIndex]]);
    indices[minIndex] += 1;
  }
  return result;
};

const workerMapper = (chunk) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: null });

    worker.postMessage(chunk);
    worker.on(WORKER_EVENT.MESSAGE, resolve);
    worker.on(WORKER_EVENT.ERROR, reject);
    worker.on(WORKER_EVENT.EXIT, (code) => {
      if (code !== EXIT_CODE_SUCCESS) {
        reject(new Error(`${WORKER_EXIT_CODE_ERROR} ${code}`));
      }
    });
  });
};

const main = async () => {
  let dataRaw;

  try {
    dataRaw = await fs.readFile(dataPath, READ_FILE_CONFIG);
  } catch {
    throw new Error(FS_OPERATION_FAILED);
  }

  const numArray = JSON.parse(dataRaw);

  const numberOfChunks = os.cpus().length;
  const chunks = splitIntoChunks(numArray, numberOfChunks);

  const sortedChunks = await Promise.all(chunks.map(workerMapper));

  const merged = mergeSorted(sortedChunks);

  console.log(merged);
};

await main();
